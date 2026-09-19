import { Agent } from "@openai/agents";
import { orderAgentBehavior } from "../helpers/agents";
import { olimpicaMCP } from "../MCPs/OlimpicaMCP";

export const OrdersHandoff = new Agent({
  name: "Orders Agent",
  instructions: orderAgentBehavior,
  mcpServers: [olimpicaMCP.toMCP()],
  model: 'gpt-4.1-mini',
});
