"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface WsMessage {
  channel: string;
  data: unknown;
  timestamp: string;
}

interface UseWebSocketReturn {
  connected: boolean;
  messages: WsMessage[];
  lastMessage: WsMessage | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

function getWsUrl(channels: string[]): string {
  const base = API_BASE.replace(/^http/, "ws");
  return `${base}/ws?channels=${channels.join(",")}`;
}

export function useWebSocket(channels: string | string[]): UseWebSocketReturn {
  const channelList = Array.isArray(channels) ? channels : [channels];
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<WsMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(getWsUrl(channelList));
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "connected" || msg.type === "pong") return;
          const wsMsg: WsMessage = {
            channel: msg.channel,
            data: msg.data,
            timestamp: msg.timestamp,
          };
          setLastMessage(wsMsg);
          setMessages((prev) => [wsMsg, ...prev].slice(0, 100));
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        // Reconnect after 3s
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      // WebSocket not available (SSR or connection refused)
      reconnectTimer.current = setTimeout(connect, 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { connected, messages, lastMessage };
}
