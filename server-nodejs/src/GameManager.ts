import { Socket } from "socket.io"
import { Game } from "./Game"
import { INIT_GAME, MOVE } from "."

export class GameManager {
  private games: Game[]
  private pendingUser: Socket | null
  private users: Socket[]
  private name: string[]

  constructor() {
    this.games = []
    this.pendingUser = null
    this.users = []
    this.name = []
  }

  addUser(socket: Socket) {
    this.users.push(socket)
    this.handleMessage(socket)
  }

  removeUser(socket: Socket) {
    this.users = this.users.filter(user => user != socket)
    console.log(this.users.length)
  }

  handleMessage(socket: Socket) {
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString())
      if (message.type === INIT_GAME) {
        this.name.push(message.name)
        if (this.pendingUser) {
          // start game
          const game = new Game(this.pendingUser, socket, this.name[0], this.name[1])
          this.games.push(game)
          this.pendingUser = null
          this.name = []
        }
        else {
          this.pendingUser = socket
        }
      }

      if (message.type == MOVE) {
        const game = this.games.find(game => game.player1 === socket || game.player2 === socket)
        if (game) {
          game.makeaMove(socket, message)
        }
      }
    })
  }
}