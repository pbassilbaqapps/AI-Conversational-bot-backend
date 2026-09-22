import "dotenv/config";
import { Agent, run, handoff } from "@openai/agents";
import { masterAgentBehavior } from "../constants/agents";
import { RedisService } from "./RedisService";
import { UsersHandoff } from "../handoffs/users.handoff";
import { OrdersHandoff } from "../handoffs/orders.handoff";
import { createClient, RedisClientType } from "redis";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

if (!apiKey) {
  throw new Error("Falta definir OPENAI_API_KEY en el archivo .env");
}

type AgentServiceResponse = {
  message: string;
  model?: string;
};

class AgentService {
  private agent: Agent;
  private redisClient: RedisClientType;
  
  constructor() {
    this.redisClient = createClient({
      url: REDIS_URL,
    });
    this.redisClient.on("error", (error) => {
      console.error("Redis error:", error);
    });
    this.redisClient.on("connect", () => {
      console.log("Conectado a Redis correctamente.");
    });
    this.redisClient.connect()

    this.agent = new Agent({
      name: "Orders Agent",
      instructions: masterAgentBehavior,
      //mcpServers: mcps,
      model,
      handoffs: [
        handoff(UsersHandoff),
        handoff(OrdersHandoff),
      ],
    });
  }

  getAgent() {
    return this.agent;
  }

  async sendMessage(prompt: string, sessionId: string): Promise<AgentServiceResponse> {
    // Se crea una nueva instancia de RedisService para manejar la sesión del usuario
    const redisService: RedisService = new RedisService(
      sessionId,
      this.redisClient,
    );

    const result = await run(
      this.agent,
      prompt,
      {
        session: redisService,
      }
    );

    return {
      message: result?.finalOutput || "No se pudo generar una respuesta.",
      model,
    };
  }

  clearSession(sessionId: string) {
    try {
      const session = new RedisService(
        sessionId,
        this.redisClient,
      );

      session.clearSession().catch((err) => console.error("Error clearing session on disconnect:", err));
    } catch (err) {
      throw new Error("Error clearing session")
    }
  }

  async quit() {
    try {
      await this.redisClient.quit().catch((err) => console.error("Error closing Redis connection:", err));
    } catch (err) {
      throw new Error("Error clearing session")
    }
  }
}


export const agentService = new AgentService()
