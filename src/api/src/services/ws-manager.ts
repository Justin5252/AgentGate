import type { WebSocket } from "@fastify/websocket";

export type WsChannel = "audit" | "anomalies";

interface WsClient {
  socket: WebSocket;
  channels: Set<WsChannel>;
}

export class WebSocketManager {
  private clients: Map<string, WsClient> = new Map();

  addClient(id: string, socket: WebSocket, channels: WsChannel[]): void {
    this.clients.set(id, {
      socket,
      channels: new Set(channels),
    });

    socket.on("close", () => {
      this.clients.delete(id);
    });

    socket.on("error", () => {
      this.clients.delete(id);
    });
  }

  removeClient(id: string): void {
    this.clients.delete(id);
  }

  broadcast(channel: WsChannel, data: unknown): void {
    const message = JSON.stringify({ channel, data, timestamp: new Date().toISOString() });

    for (const [id, client] of this.clients) {
      if (!client.channels.has(channel)) continue;

      try {
        if (client.socket.readyState === 1) {
          client.socket.send(message);
        }
      } catch {
        this.clients.delete(id);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getChannelCounts(): Record<WsChannel, number> {
    const counts: Record<WsChannel, number> = { audit: 0, anomalies: 0 };
    for (const client of this.clients.values()) {
      for (const channel of client.channels) {
        counts[channel]++;
      }
    }
    return counts;
  }
}
