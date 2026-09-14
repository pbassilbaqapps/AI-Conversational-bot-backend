import "dotenv/config";
import { Agent, run, MCPServerStreamableHttp } from "@openai/agents";
import OpenAI from "openai";
import { alternateBehavior } from "./agents";
import { RedisSession } from "./RedisSession";

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

if (!apiKey) {
  throw new Error("Falta definir OPENAI_API_KEY en el archivo .env");
}

const openai = new OpenAI({ apiKey });

type GeneratedTextResponse = {
  message: string;
  model?: string;
};

type GeneratedTextAgentsResponse = {
  message: string;
  model?: string;
};
  
/** Genera una respuesta de texto a partir de un prompt. */
export async function generarTexto(
  prompt: string,
): Promise<GeneratedTextResponse> {
  const response = await openai.responses.create({
    input: prompt,
    model,
  });

  return {
    message: response.output_text,
    model,
  };
}

/** Genera una respuesta de texto a partir de un prompt. */
export async function generarTextoAgents(
  prompt: string,
  mcps: MCPServerStreamableHttp[] = [],
  session: RedisSession
): Promise<GeneratedTextAgentsResponse> {
  const agent = new Agent({
    name: "Orders Agent",
    instructions: alternateBehavior,
    mcpServers: mcps,
    model,
  });

  const result = await run(
    agent,
    prompt,
    {
      session,
    }
  );

  return {
    message: result?.finalOutput || "No se pudo generar una respuesta.",
    model,
  };
}
