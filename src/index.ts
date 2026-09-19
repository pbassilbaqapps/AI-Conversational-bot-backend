import 'dotenv/config';
import express, { type Request, type Response } from "express";
import { generarTexto } from "./helpers/openai";
import SocketService from "./socket/SocketService";
import { createClient } from 'redis';
import { olimpicaMCP } from './MCPs/OlimpicaMCP';

// Crea la aplicacion principal de Express y define los puertos de entrada.
const app = express();
const SOCKET_PORT = 3001;
const API_PORT = Number(process.env.PORT) || 3000;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: REDIS_URL,
});
redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});
redisClient.on("connect", () => {
  console.log("Conectado a Redis correctamente.");
});

// Permite recibir cuerpos JSON en las peticiones HTTP.
app.use(express.json());

// Endpoint de prueba para confirmar que la API REST responde correctamente.
app.get("/api/hello", (_request: Request, response: Response) => {
  response.json({
    ok: true,
    message: "Hola desde Express.js y TypeScript",
    timestamp: new Date().toISOString(),
  });
});

// Endpoint principal para enviar un mensaje a OpenAI y devolver la respuesta generada.
app.post("/api/message", (_request: Request, response: Response) => {
  const { message } = _request.body;

  generarTexto(message)
    .then((generatedText) => {
      const {message, model} = generatedText;

      response.json({
        ok: true,
        message,
        model,
        timestamp: new Date().toISOString(),
      });
    })
    .catch((error) => {
      console.error("Error al generar el texto:", error);
      response.status(500).json({
        ok: false,
        message: "Error al generar el texto",
        model: "none",
        error: error.message,
      });
    });
});

let socketService;

const boostrap = async () => {
  try {
    await redisClient.connect();
    await olimpicaMCP.connect();

    socketService = new SocketService(SOCKET_PORT, redisClient, '*');
    socketService.start();

    app.listen(API_PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${API_PORT}`);
    });
  } catch (error) {
    console.error("Error al inicializar el backend:", error);
  }
};

boostrap();
