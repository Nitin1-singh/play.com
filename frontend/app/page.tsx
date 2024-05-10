"use server"
import { ChessBoardWrapper } from "@/components/ChessBoard";
import { Color, PieceSymbol, Square } from "chess.js";

interface boardI {
  square: Square;
  type: PieceSymbol;
  color: Color;
}

export type boardType = (boardI | null)[][]

export default async function Home() {
  return (
    <main>
      <ChessBoardWrapper />
    </main>
  )
}