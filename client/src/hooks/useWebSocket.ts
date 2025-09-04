import { useEffect, useRef, useState } from "react";
import type { WebSocketMessage } from "@/types/moderation";

export function useWebSocket(url: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        setLastMessage(message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, lastMessage, sendMessage };
}
