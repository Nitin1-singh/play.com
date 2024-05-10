import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import { GameManager } from "./GameManager"

// env variable
const PORT = 8000
export const INIT_GAME = "init_game"
export const MOVE = "move"
export const GAME_OVER = "game_over"
export const color = "color"
export const TURN = "turn"
export const UPDATE_BOARD = "board"
// variable
const app = express()
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

const gameManager = new GameManager()

app.get("/", (req, res) => res.json("Health Check"))

io.on("connection", (socket) => {
  console.log("socket connect", socket.id)
  gameManager.addUser(socket)
  socket.on("disconnect", () => {
    console.log("socket disconnect", socket.id)
    gameManager.removeUser(socket)
  })
})

server.listen(PORT, () => console.log("listing at port", PORT))