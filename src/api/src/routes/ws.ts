import type { FastifyInstance } from "fastify";
import type { WsChannel } from "../services/ws-manager.js";

const VALID_CHANNELS: WsChannel[] = ["audit", "anomalies"];

export async function wsRoutes(server: FastifyInstance) {
  server.get("/ws", { websocket: true }, (socket, request) => {
    const query = request.query as { channels?: string };
    const requestedChannels = (query.channels ?? "audit,anomalies")
      .split(",")
      .map((c) => c.trim())
      .filter((c): c is WsChannel => VALID_CHANNELS.includes(c as WsChannel));

    if (requestedChannels.length === 0) {
      socket.close(1008, "No valid channels specified");
      return;
    }

    const clientId = crypto.randomUUID();
    server.wsManager.addClient(clientId, socket, requestedChannels);

    // Send a welcome message
    socket.send(
      JSON.stringify({
        type: "connected",
        clientId,
        channels: requestedChannels,
        timestamp: new Date().toISOString(),
      })
    );

    socket.on("message", (raw: Buffer | ArrayBuffer | Buffer[]) => {
      // Handle ping/pong
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "ping") {
          socket.send(JSON.stringify({ type: "pong", timestamp: new Date().toISOString() }));
        }
      } catch {
        // Ignore malformed messages
      }
    });

    socket.on("close", () => {
      server.wsManager.removeClient(clientId);
    });
  });
}
