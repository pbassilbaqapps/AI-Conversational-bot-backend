import http from "http";
import { Server, Socket } from "socket.io";
import { generarTextoAgents } from "../helpers/openai";
import { AgentResponse } from "../helpers/agents";
import { MCPServerStreamableHttp } from "@openai/agents";

export default class SocketService {
  private socketServer: http.Server;
  private io: Server;
  private port: number;
  private corsOrigin?: string | string[];
  private ordersMcp: MCPServerStreamableHttp;

  constructor(port: number, corsOrigin?: string | string[]) {
    this.port = port;
    this.corsOrigin = corsOrigin;

    this.socketServer = http.createServer();
    this.io = new Server(this.socketServer, {
      cors: {
        origin: this.corsOrigin,
      },
    });

    this.ordersMcp =
      new MCPServerStreamableHttp({
        url: "http://localhost:3002/mcp",

        name: "Orders MCP",
      });

    this.io.on("connection", (socket: Socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket, callback?: (message: string) => void) {
    console.log(`Socket connected: ${socket.id}`);

    this.ordersMcp.connect()
    socket.on("message_in", async (payload: unknown) => {
      try {
        debugger
        const response = await generarTextoAgents(payload as string || '', [this.ordersMcp]);

        const {
          estado = null,
          accion = null,
          mensaje = "No se pudo generar una respuesta.",
          parametrosFaltantes = [],
          parametrosEntrantes = [],
        } = JSON.parse(response?.message) as AgentResponse || null;

        if (!estado || !accion || estado !== 'exitosa') {
          socket.emit("messages_updated", response?.message || "No se pudo generar una respuesta.");
          return;
        }

        if (estado === 'exitosa' && accion === 'mensaje_comun') {
          socket.emit("messages_updated", mensaje);
          return;
        }

        socket.emit("messages_updated", response?.message || "No se pudo generar una respuesta.");
      } catch (error) {
        socket.emit("messages_updated", "Error al procesar el mensaje.");
        console.error("Error handling message_in:", error);
      }
    });

    socket.on("disconnect", () => {
      socket.emit("messages_updated", "Socket disconnected.");
      console.log(`Socket disconnected: ${socket.id}`);
    });
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socketServer.listen(this.port, () => {
        console.log(`Socket.IO server running on port ${this.port}`);
        resolve();
      });
      this.socketServer.on("error", (err) => reject(err));
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.io.close(() => {
        this.socketServer.close((err) => (err ? reject(err) : resolve()));
      });
    });
  }
}
