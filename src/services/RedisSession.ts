import type {
  AgentInputItem,
  Session,
} from "@openai/agents";

import type { RedisClientType } from "redis";

export class RedisSession implements Session {
  constructor(
    private readonly sessionId: string,
    private readonly redis: RedisClientType,
  ) {}

  async getSessionId(): Promise<string> {
    return this.sessionId;
  }

  private get key(): string {
    return `agent-session:${this.sessionId}`;
  }

  async getItems(
    limit?: number,
  ): Promise<AgentInputItem[]> {
    const rawItems = await this.redis.lRange(
      this.key,
      0,
      -1,
    );

    const items = rawItems.map(
      (item) => JSON.parse(item),
    );

    return limit
      ? items.slice(-limit)
      : items;
  }

  async addItems(
    items: AgentInputItem[],
  ): Promise<void> {
    if (items.length === 0) return;

    await this.redis.rPush(
      this.key,
      items.map((item) =>
        JSON.stringify(item),
      ),
    );
  }

  async popItem(): Promise<
    AgentInputItem | undefined
  > {
    const item = await this.redis.rPop(
      this.key,
    );

    return item
      ? JSON.parse(item)
      : undefined;
  }

  async clearSession(): Promise<void> {
    await this.redis.del(this.key);
  }
}