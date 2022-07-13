import React, { useState } from "react";
import ChessBoard from "chessboardjsx";
const { Chess } = require("chess.js");

function Local () {
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  function dropPiece ({piece, sourceSquare, targetSquare}: any) {
	const promotions = game.moves({ verbose: true }).filter((m: any) => m.promotion);
	let promotionTo = undefined;
	if(promotions.some((p: any) => `${p.from}:${p.to}` == `${sourceSquare}:${targetSquare}`)) {
	  promotionTo = prompt("Promote your pawn to: r (rook), b (bishop), q (queen), or n (knight).");
	  if(!(promotionTo == "r" || promotionTo == "b" || promotionTo == "q" || promotionTo == "n")) {
		alert("You did not enter a valid promotion to, your pawn will automatically be promoted to a queen.");
		promotionTo = "q";
	  }
	}
	const legalMove = game.move({
	  from: sourceSquare,
	  to: targetSquare,
	  promotion: promotionTo,
	});
	if(legalMove) {
	  setFen(game.fen());
	}
  }
  function highlight (square: any) {
	let moves = game.moves({ square, verbose: true });
	if(moves.length !== 0) {
	  moves.map((move: any) => {
		let highlightable = (document.querySelector(`[data-squareid="${move.to}"]`))! as HTMLElement;
		if(highlightable) {
		  highlightable.style.boxShadow = 'inset 0 0 1px 4px yellow'
		}
	  })
	}
  }
  function dehighlight () {
	document.querySelectorAll("[data-squareid]").forEach((square: any) => {
	  square.style.boxShadow = "";
	})
  }
  function undoMove () {
	if(game.undo()) {
	  setFen(game.fen())
	}
  }
  function resetBoard () {
	game.reset();
	setFen(game.fen())
  }
  return <div className="local">
	<div className="navbar">
	  <h1 style={{textDecoration: "underline"}}>Pass n' play</h1>
  	  <h2>Vivaan Chess</h2>
	  <p>Online chess for all...</p>
	  <a href="/dashboard">Home</a>
	</div>
  	<ChessBoard dropSquareStyle={{}} width={400} position={fen} onDrop={dropPiece} onMouseOverSquare={highlight} onMouseOutSquare={dehighlight} showNotation={false}/>
	<button className="button" onClick={undoMove}>Undo last move</button>
	<button className="button" onClick={resetBoard}>Reset</button>
  </div>
}

export default Local;