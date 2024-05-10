"use client"
import { Chessboard } from "react-chessboard";
import { Square } from "chess.js";
import { useEffect, useRef, useState } from "react";
import { BoardOrientation, Piece, PromotionPieceOption } from "react-chessboard/dist/chessboard/types";
import { useSocket } from "./Socket";
import Image from "next/image";
import { Loading } from "./Loading";

export function ChessBoardWrapper() {
  // for user name etc
  const nameRef = useRef<HTMLInputElement | null>(null)
  const [fen, setFen] = useState<string>("")
  const [win, setWin] = useState<boolean>(false)
  const [from, setFrom] = useState<Square | null>(null)
  const [turn, setTurn] = useState<boolean>(false)
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [gameStart, setGameStart] = useState<boolean>(false)
  const [color, setColor] = useState<"white" | "black" | null>(null)

  const [player1, setPlayer1] = useState<{ color: BoardOrientation, name: string, name2: string } | null>(null)

  const [over, setOver] = useState<"Yes" | "No">("No")
  const { socket } = useSocket()
  const [loading, setLoading] = useState<boolean>(false)
  // Events 
  const INIT_GAME = "init_game"
  const MOVE = "move"
  const GAME_OVER = "game_over"
  const TURN = "turn"

  useEffect(() => {

    socket?.on(INIT_GAME, (data) => {
      setColor(JSON.parse(data).color)
      if (JSON.parse(data).color === "white") {
        setTurn(true)
      }
      setPlayer1({ color: JSON.parse(data).color, name: JSON.parse(data).name, name2: JSON.parse(data).name2 })
      setFen(JSON.parse(data).fen)
      setLoading(false)
      setGameStart(true)
    })

    socket?.on("board", (data) => {
      setFen(JSON.parse(data).fen)
    })
    socket?.on(TURN, (data) => {
      if (data === color) {
        setTurn(true)
        return
      }
      setTurn(false)

    })
    socket?.on(GAME_OVER, (data) => {
      setOver("Yes")
      if (JSON.parse(data).winner === color) {
        setWin(true)
        return
      }
      setWin(false)
    })
  }, [socket, color])

  const handleClick = () => {
    setLoading(true)
    socket?.emit("message", JSON.stringify({ type: INIT_GAME, name: nameRef.current?.value }))
  }

  const handlePieceClick = (piece: Piece, square: Square) => {
    if (piece.includes("w") && player1?.color == "white" || piece.includes("b") && player1?.color == "black") {
      setSelectedPiece(piece)
      setFrom(square)
    }
  }

  const handleSquareClick = (square: Square) => {
    if (selectedPiece && gameStart) {
      socket?.emit("message", JSON.stringify({ type: MOVE, from: from, to: square, promotion: "q" }))
    }
  }
  if (loading) return (
    <div className="bg-[#302E2B] gap-5 h-screen flex flex-col justify-center items-center">
      <Loading />
      <span className="text-white text-2xl font-semibold">Searching ...</span>
    </div>

  )


  if (over == "Yes") {
    if (win) {
      return (
        <div className="h-screen gap-5 bg-[#302E2B] flex flex-col justify-center items-center">
          <Image src={"/win.png"} alt="win" width={100} height={100} />
          <p> You Win {player1?.name}</p>
        </div>
      )
    }
    else {
      return (
        <div className="h-screen gap-5 bg-[#302E2B] flex flex-col justify-center items-center">
          <Image src={"/lose.png"} alt="lose" width={100} height={100} />
          <p className="text-3xl font-semibold text-white">You Lose {player1?.name}</p>
        </div>
      )
    }
  }
  // Game component returned jsx
  if (gameStart)
    return (
      <div className="bg-[#302E2B] h-screen flex flex-col gap-5 py-5 justify-center">
        <div style={{
          maxWidth: "70vh",
          width: "70vw"
        }}
          className={`flex flex-row items-center gap-5 mx-auto ${turn ? "" : "border border-green-400 p-2"}`}>
          <Image src={player1?.color == "white" ? "/black.png" : "/white.png"} width={40} height={40} alt="image" />
          <p className="text-white text-2xl font-semibold">{player1?.name2}</p>
        </div>
        <div style={{
          maxWidth: "70vh",
          width: "70vw"
        }} className={`mx-auto`}>
          <Chessboard
            boardOrientation={player1?.color}
            onSquareClick={handleSquareClick}
            onPieceClick={handlePieceClick}
            position={fen}
            areArrowsAllowed={false}
            arePiecesDraggable={false}
          />
        </div>
        <div style={{
          maxWidth: "70vh",
          width: "70vw"
        }} className={`flex flex-row items-center gap-5 mx-auto ${turn ? "border border-green-400 p-2" : ""}`}>
          <Image src={player1?.color == "white" ? "/white.png" : "/black.png"} width={40} height={40} alt="image" />
          <p className="text-white text-2xl font-semibold">{player1?.name}</p>
        </div>
      </div >
    );
  // login page
  if (!gameStart) return (
    <div className="max-sm:flex-col max-sm:pt-3 flex flex-row justify-evenly h-screen w-screen bg-[#302E2B] pt-10">
      <div className="flex flex-row max-sm:justify-center">
        <Image className="h-fit" src={"/chess.png"} alt="chess" width={50} height={50} />
        <p className="text-white text-4xl">Play.com</p>
      </div>
      <div className="relative h-[500px] basis-1/2 flex flex-row">
        <Image alt="board-image" src={"/board.png"} objectFit="contain" objectPosition="center" fill={true} />
      </div>
      <div className="basis-1/4 gap-10 flex flex-col h-full">
        <div className="text-center">
          <p className="text-5xl text-white font-semibold"> Play Chess Online on the #1 Site! </p>
        </div>
        <div className="flex flex-col gap-10 max-sm:px-5">
          <input className="bg-[#302E2B] text-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-blue-500" ref={nameRef} placeholder="Enter your name" />
          <div className="bg-[#81B64C] flex flex-row justify-center  px-7 py-3 gap-5 rounded-xl hover:cursor-pointer" onClick={handleClick}>
            <Image className="pt-2" width={40} height={40} src={"/move.png"} alt="chess-image" />
            <p className="text-white text-3xl font-semibold">Play Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}

