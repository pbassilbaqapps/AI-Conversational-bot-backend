import 'dotenv/config';
import express, { type Request, type Response } from "express";
import SocketService from "./services/SocketService";
import { olimpicaMCPClient } from './MCPs/OlimpicaMCPClient';

// Crea la aplicacion principal de Express y define los puertos de entrada.
const app = express();
const SOCKET_PORT = 3001;
const API_PORT = Number(process.env.PORT) || 3000;

// Permite recibir cuerpos JSON en las peticiones HTTP.
app.use(express.json());

// Endpoint de prueba para confirmar que la API REST responde correctamente.
app.get("/api/health", (_request: Request, response: Response) => {
  response.json({
    ok: true,
    message: "Hola desde Express.js y TypeScript",
    timestamp: new Date().toISOString(),
  });
});

let socketService;

const boostrap = async () => {
  try {
    await olimpicaMCPClient.connect();

    socketService = new SocketService(SOCKET_PORT, '*');
    socketService.start();

    app.listen(API_PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${API_PORT}`);
    });
  } catch (error) {
    console.error("Error al inicializar el backend:", error);
  }
};

boostrap();
