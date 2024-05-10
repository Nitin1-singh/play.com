"use client"
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

export function useSocket() {
  const API = "http://localhost:8000"
  const [socket, setSocket] = useState<Socket | null>(null)
  useEffect(() => {
    if (socket != null) return
    const newSocket = io(API)
    setSocket(newSocket)
  }, [])
  return { socket }
}