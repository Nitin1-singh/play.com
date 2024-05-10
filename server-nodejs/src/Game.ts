import { Socket } from "socket.io";
import { Chess } from "chess.js"
import { GAME_OVER, INIT_GAME, TURN, UPDATE_BOARD, color } from ".";

export class Game {
  public name1: string
  public name2: string

  public player1: Socket
  public player2: Socket
  private board: Chess
  private moves: string[]
  private startTime: Date

  constructor(player1: Socket, player2: Socket, name1: string, name2: string) {
    this.player1 = player1
    this.player2 = player2
    this.name1 = name1
    this.name2 = name2
    this.board = new Chess()
    this.moves = []
    this.startTime = new Date()

    this.player1.emit(INIT_GAME, JSON.stringify({
      color: "white",
      fen: this.board.fen(),
      name: this.name1,
      name2: this.name2
    }))

    this.player2.emit(INIT_GAME, JSON.stringify({
      color: "black",
      fen: this.board.fen(),
      name: this.name2,
      name2: this.name1
    }))
  }

  makeaMove(socket: Socket, move: { from: string, to: string }) {
    if (socket === this.player1 || socket === this.player2) {
      try {
        this.board.move(move)
        this.player1.emit(UPDATE_BOARD, JSON.stringify({ fen: this.board.fen() }))
        this.player1.emit(TURN, this.board.turn() === "w" ? "white" : "black")

        this.player2.emit(UPDATE_BOARD, JSON.stringify({ fen: this.board.fen() }))
        this.player2.emit(TURN, this.board.turn() === "w" ? "white" : "black")
      } catch (e) {
        console.log(e)
      }

    }
    if (this.board.isGameOver()) {
      this.player1.emit(GAME_OVER, JSON.stringify({ type: GAME_OVER, winner: this.board.turn() === "w" ? "Black" : "White" }))
      this.player2.emit(GAME_OVER, JSON.stringify({ type: GAME_OVER, winner: this.board.turn() === "w" ? "Black" : "White" }))
    }
  }
}