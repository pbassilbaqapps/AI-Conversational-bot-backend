import { Agent } from "@openai/agents";
import { orderAgentBehavior } from "../constants/agents";
import { olimpicaMCPClient } from "../MCPs/OlimpicaMCPClient";

export const OrdersHandoff = new Agent({
  name: "Orders Agent",
  instructions: orderAgentBehavior,
  mcpServers: [olimpicaMCPClient.toMCP()],
  model: 'gpt-4.1-mini',
});
