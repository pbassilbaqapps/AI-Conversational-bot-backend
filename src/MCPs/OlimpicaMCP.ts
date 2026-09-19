import { MCPServerStreamableHttp } from "@openai/agents";

class OlimpicaMCP {
  private MCP: MCPServerStreamableHttp;
  private connectPromise?: Promise<void>;
  private isConnected = false;

  constructor() {
    this.MCP = new MCPServerStreamableHttp({
      url: "http://localhost:3002/mcp",

      name: "Orders MCP",
    });
  }

  async connect() {
    if (this.isConnected) {
      return;
    }

    if (!this.connectPromise) {
      this.connectPromise = this.MCP.connect()
        .then(() => {
          this.isConnected = true
          console.log("Olimpica MCP conectado correctamente.")
        })
        .catch((error) => {
          this.connectPromise = undefined
          throw error
        })
    }

    await this.connectPromise
  }

  async start() {
    await this.connect()
  }

  toMCP() {
    return this.MCP
  }
}

export const olimpicaMCP = new OlimpicaMCP()
