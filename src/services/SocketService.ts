import http from "http";
import { Server, Socket } from "socket.io";
import { agentService } from "./AgentService"

export default class SocketService {
  private socketServer: http.Server;
  private io: Server;
  private port: number;
  private corsOrigin?: string | string[];

  constructor(port: number, corsOrigin?: string | string[]) {
    this.port = port;
    this.corsOrigin = corsOrigin;
    this.socketServer = http.createServer();
    this.io = new Server(this.socketServer, {
      cors: {
        origin: this.corsOrigin,
      },
    });

    this.io.on("connection", (socket: Socket) => this.handleConnection(socket));
  }

  private handleConnection(socket: Socket) {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("message_in", async (payload: unknown) => {
      try {
        // Primero extraemos el mensaje y el sessionId del payload recibido
        const {
          message,
          sessionId
        } = JSON.parse(payload as string) as {
          message: string;
          sessionId: string;
        };

        // Se llama a la función generarTextoAgents para procesar el mensaje y obtener la respuesta del agente
        const response = await agentService.sendMessage(message, sessionId);
        // Se envía la respuesta de vuelta al cliente a través del socket
        const mensaje = response?.message || "No se pudo generar una respuesta.";
        socket.emit("messages_updated", mensaje);
      } catch (error) {
        console.log(error)
        socket.emit("messages_updated", "Error al procesar el mensaje.");
        console.error("Error handling message_in:", error);
      }
    });

    // Este evento es para pruebas y para confirmar que la comunicación vía socket funciona correctamente
    socket.on("test", async (payload: unknown) => {
      console.log("Received test event with payload:", payload);
      socket.emit("test_response", { message: "Test event received successfully!" });
    });

    // Este evento se encarga de limpiar la sesión en Redis cuando el cliente lo solicita
    socket.on("clear_session", async (payload: unknown) => {
      try {
        const {
          sessionId
        } = JSON.parse(payload as string) as {
          sessionId: string;
        };

        agentService.clearSession(sessionId)

        socket.emit("messages_updated", `Session ID ${sessionId} desconectada.`);
        console.log(`Socket disconnected: ${socket.id}`);
      } catch (error) {
        socket.emit("messages_updated", "Error al procesar el mensaje.");
        console.error("Error handling message_in:", error);
      }
    });

    socket.on("disconnect", () => {
      try {
        socket.emit("messages_updated", `Socket ID ${socket.id} desconectada.`);
        console.log(`Socket disconnected: ${socket.id}`);
      } catch (error) {
        socket.emit("messages_updated", "Error al procesar el mensaje.");
        console.error("Error handling message_in:", error);
      }
    });
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socketServer.listen(this.port, () => {
        console.log(`Socket ejecutandose en el puerto ${this.port}`);
        resolve();
      });
      this.socketServer.on("error", (err) => reject(err));
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      agentService.quit()
      this.io.close(() => {
        this.socketServer.close((err) => (err ? reject(err) : resolve()));
      });
    });
  }
}
