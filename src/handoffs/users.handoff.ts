import { Agent } from "@openai/agents";
import { userAgentBehavior } from "../helpers/agents";
import { olimpicaMCP } from "../MCPs/OlimpicaMCP";

export const UsersHandoff = new Agent({
  name: "Usrs Agent",
  instructions: userAgentBehavior,
  mcpServers: [olimpicaMCP.toMCP()],
  model: 'gpt-4.1-mini',
});
