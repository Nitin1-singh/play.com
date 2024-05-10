"use client"
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  useEffect(() => {
    if (socket != null) return
    const newSocket = io(process.env.NEXT_PUBLIC_API as string,{})
    setSocket(newSocket)
  }, [])
  return { socket }
}