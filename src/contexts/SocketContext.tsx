import { useContext, createContext } from "react";
import useSocket from "../hooks/useSocket";

const SocketContext = createContext(null);

export function SocketContextProvider({ children, url, token, userId }) {
  const socket = useSocket({ url, token, userId });
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

export function useSocketContext() {
  const ctx = useContext(SocketContext);
  if (!ctx) return null;
  return ctx;
}
