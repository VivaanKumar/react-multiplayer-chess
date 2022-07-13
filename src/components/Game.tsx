import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChessBoard from "chessboardjsx";
import { db } from "../Firebase";
const { Chess } = require("chess.js");
const move = require("./move.mp3");

function Local () {
  const [game, setGame] = useState(new Chess());
  const id = useParams().id;
  const [side, setSide] = useState("w");
  const [said, setSaid] = useState(false);
  const [fen, setFen] = useState<string>("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [allowed, setAllowed] = useState(true);
  const [waiting, setWaiting] = useState(true);
  const [state, setState] = useState<any>(null);
  let moveSfx = new Audio(move);
  useEffect(() => {
    db.collection("games").doc(id).onSnapshot((doc) => {
      moveSfx.play();
      console.log(doc?.data()?.members)
      // for(let i = 0; i < doc?.data()?.members.length; i ++) {
      //   console.log(doc?.data()?.members[i])
      //   if(doc?.data()?.members[i].white && doc?.data()?.members[i].white == localStorage.getItem("email")){
      //     //we white
      //     console.log("WE WHITE")
      //   } else if(doc?.data()?.members[i].black && doc?.data()?.members[i].white == localStorage.getItem("email")){
      //     //we black
      //     console.log("WE BLACK")
      //   }
      // }
      const fen = doc?.data()?.fen;
      console.log(doc?.data()?.members)
      if(doc?.data()?.members.length >= 2) {
        setWaiting(false);
      }
      setFen(fen);
      setState(null);
      setGame(new Chess(fen));
      if(new Chess(fen).in_check()) {
        setState({
          what: (new Chess(fen).turn() == "b" ? "Black" : "White"),
          user: " is in check"
        })
      }
      if(new Chess(fen).in_checkmate()) {
        setState({
          what: "Checkmate, ",
          user: (`loser: ` + (new Chess(fen).turn() == "b" ? "black" : "white")),
        })
        if(new Chess(fen).insufficient_material()) {
          setState({
            what: "Insufficient material,",
            user: (`no winner`),
          })
        }
        if(new Chess(fen).in_stalemate()) {
          setState({
            what: "Insufficient material,",
            user: (`no winner`),
          })
        }
        if(new Chess(fen) .in_threefold_repetition()) {
          console.log(new Chess(fen).turn(), new Chess(fen).in_checkmate())
          setState({
            what: "Three fold repition,",
            user: (`no winner`),
          })
        }
      }
    })
  }, []);
  useEffect(() => {
    if(!localStorage.getItem("email") && (said == false)) {
      alert("Log in first, then reopen the game url")
      window.location.href = "/";
    }
    db.collection("games").doc(id).get().then((doc) => {
      const data = doc?.data()!;
      const userEmail = localStorage.getItem("email");
      if(data.creator == userEmail) {
        //the creator
        for(let i = 0; i< data.members.length; i++) {
          console.log(data.creator, data.members[i].white)
          if(data.members[i].white == userEmail) {
            console.log("CREATOR = W")
            setSide("w");
            break;
          } else {
            console.log("CREATOR = B")
            setSide("b");
            break;
          }
        }
      } else {
        //not the creator
        console.log(data.members.length)
        if(data.members[0].white) {
          if(data.members.length <= 1 || (data.members[1].white == userEmail || data.members[1].black == userEmail)) {
            if(data.members[0].white == userEmail) {
            setSide("w");
            let members = data.members;
            if(!(members.length >= 2)) {
                members.push({
                    white: userEmail,
                  })
            } 
            db.collection("games").doc(id).update({
              members,
            })
          } else {
            setSide("b");
            let members = data.members;
            if(!(members.length >= 2)) {
                members.push({
                    black: userEmail,
                  })
            } 
            db.collection("games").doc(id).update({
              members,
            })
          }
          } else {
            setAllowed(false);
          }
        }
      }
    })
  }, [])
  function dropPiece (result: any) {
    console.log(result.piece, side)
    if(result.piece.charAt(0) == side && !waiting) {
        const promotions = game.moves({ verbose: true }).filter((m: any) => m.promotion);
        let promotionTo = undefined;
        if(promotions.some((p: any) => `${p.from}:${p.to}` == `${result.sourceSquare}:${result.targetSquare}`)) {
          promotionTo = prompt("Promote your pawn to: r (rook), b (bishop), q (queen), or n (knight).");
          if(!(promotionTo == "r" || promotionTo == "b" || promotionTo == "q" || promotionTo == "n")) {
            alert("You did not enter a valid promotion to, your pawn will automatically be promoted to a queen.");
            promotionTo = "q";
          }
        }
        const legalMove = game.move({
            from: result.sourceSquare,
            to: result.targetSquare,
            promotion: promotionTo,
          });
          if(legalMove) {
            setFen(game.fen());
            setGame(new Chess(game.fen()));
            setState(null);
            db.collection("games").doc(id).update({
              fen: game.fen(),
            })
          }
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
  return <div className="local">
	<div className="navbar">
	  <h1 style={{textDecoration: "underline"}}>Playing Online</h1>
  	  <h2>Vivaan Chess</h2>
	  <p>Online chess for all...</p>
      <a href="/dashboard">Home</a>
	</div>
  	{allowed ? (
      <>
        <p>{waiting ? "Waiting for an opponent to join..." : <>
          {state ? `${state.what} ${state?.user}` : ""}
        </>}</p>
        <ChessBoard dropSquareStyle={{}} width={400} position={fen} onDrop={dropPiece} onMouseOverSquare={highlight} onMouseOutSquare={dehighlight} showNotation={false} orientation={side == "w" ? "white" : "black"}/>
      </>
      ) : (
      <h2>This game is full and has already started...</h2>
    )}
  </div>
}

export default Local;