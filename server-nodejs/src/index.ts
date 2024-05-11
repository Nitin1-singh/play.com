import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { GameManager } from "./GameManager"
import { register, collectDefaultMetrics } from "prom-client"
import { createLogger, transports } from "winston"
import LokiTransport from "winston-loki"
// env variable
const PORT = 8000
export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"
export const color = "color"
export const TURN = "turn"
export const UPDATE_BOARD = "board"


// metrics for monitoring
const collectDefaultMetric = collectDefaultMetrics
collectDefaultMetric({ register: register })

// variable
const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

const gameManager = new GameManager()

// for logging
const options = {
  transports: [
    new LokiTransport({host:"http://localhost:3100"})
  ]
}
const logger = createLogger(options)

// for metrics
app.get("/metrics", async (req, res) => {
  logger.info("Req came on /metrics route")
  logger.error("Custom error")
  
  res.setHeader("Content-Type", register.contentType)
  const metrics = await register.metrics()
  res.send(metrics)
})



io.on("connection", (socket) => {
  console.log("socket connect", socket.id)
  gameManager.addUser(socket)
  socket.on("disconnect", () => {
    console.log("socket disconnect", socket.id)
    gameManager.removeUser(socket)
  })
})

server.listen(PORT, () => console.log("listing at port", PORT))