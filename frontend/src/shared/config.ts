/** Base URL of whichever backend (Spring or .NET) is running. Override with NEXT_PUBLIC_API_URL. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/** STOMP WebSocket endpoint (Spring backend only). */
export const WS_URL = `${API_URL.replace(/^http/, "ws")}/ws`;

export const imageUrl = (path: string) => `${API_URL}${path}`;
