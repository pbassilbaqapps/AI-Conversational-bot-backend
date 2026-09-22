import { Agent } from "@openai/agents";
import { userAgentBehavior } from "../constants/agents";
import { olimpicaMCPClient } from "../MCPs/OlimpicaMCPClient";

export const UsersHandoff = new Agent({
  name: "Users Agent",
  instructions: userAgentBehavior,
  mcpServers: [olimpicaMCPClient.toMCP()],
  model: 'gpt-4.1-mini',
});
