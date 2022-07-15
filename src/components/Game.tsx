import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChessBoard from "chessboardjsx";
import { db } from "../Firebase";
const { Chess } = require("chess.js");
const move = require("./move.mp3");

function Local() {
  const [game, setGame] = useState(new Chess());
  const id = useParams().id;
  const [side, setSide] = useState<any>(undefined);
  const [said, setSaid] = useState(false);
  const [fen, setFen] = useState<string>(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  );
  const [allowed, setAllowed] = useState(true);
  const [waiting, setWaiting] = useState(true);
  const [state, setState] = useState<any>(null);
  const [playingAgainst, setPlayingAgainst] = useState<any>(null);
  let moveSfx = new Audio(move);
  const [ourUser, setOurUser] = useState<any>(null);
  useEffect(() => {
    const uid = localStorage.getItem("email")
      ? localStorage.getItem("email")
      : null;
    if (uid) {
      db.collection("users")
        .doc(uid)
        .get()
        .then((docc) => {
          if (!docc.exists) {
            alert("Log in first, then reopen the game url");
            window.location.href = "/";
          } else {
            setOurUser(docc.data());
            console.log(docc.data());
            db.collection("games")
              .doc(id)
              .get()
              .then((doc) => {
                const data = doc?.data()!;
                const userEmail = docc.data()?.email;
                console.log(doc.data());
                console.log(data.creator, userEmail);

                if (data.creator == userEmail) {
                  for (let i = 0; i < data.members.length; i++) {
                    console.log(data.creator, data.members[i].white);
                    if (data.members[i].white == userEmail) {
                      console.log("CREATOR = W");
                      setSide("w");
                      break;
                    } else {
                      console.log("CREATOR = B");
                      setSide("b");
                      break;
                    }
                  }
                } else {
                  db.collection("users")
                    .doc(data.creatorUid)
                    .get()
                    .then((doccc) => {
                      setPlayingAgainst(doccc?.data());
                      console.log(doccc?.data());
                    });
                  if (data.members[0].white) {
                    if (
                      data.members.length <= 1 ||
                      data.members[1].white == userEmail ||
                      data.members[1].black == userEmail
                    ) {
                      if (data.members[0].white == userEmail) {
                        setSide("w");
                        let members = data.members;
                        if (!(members.length >= 2)) {
                          members.push({
                            white: userEmail,
                            uid: localStorage.getItem("email"),
                          });
                        }
                        db.collection("games").doc(id).update({
                          members,
                        });
                      } else {
                        setSide("b");
                        let members = data.members;
                        if (!(members.length >= 2)) {
                          members.push({
                            black: userEmail,
                            uid: localStorage.getItem("email"),
                          });
                        }
                        db.collection("games").doc(id).update({
                          members,
                        });
                      }
                    } else {
                      setAllowed(false);
                    }
                  }
                }
              });
          }
        });
    } else {
      alert("Log in first, then reopen the game url");
      window.location.href = "/";
    }
  }, []);
  function addElo () {
    const addedElo = Math.floor(Math.random() * 30 + 30);
    alert(`You came victorius! You get ${addedElo} added elo! Well done, and you may go back to the dashboard.`)
  }
  function takeElo () {
    const addedElo = Math.floor(Math.random() * 30 + 30);
    alert(`You lost! You get ${addedElo} subtracted elo. Better luck next time. You may go back to the dashboard.`)
  }
  useEffect(() => {
    db.collection("games")
      .doc(id)
      .onSnapshot((doc) => {
        moveSfx.play();
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
        console.log(doc?.data()?.members);
        if (doc?.data()?.members.length >= 2 && waiting == true) {
          setWaiting(false);
        }
        setFen(fen);
        setState(null);
        setGame(new Chess(fen));
        if (new Chess(fen).in_check()) {
          setState({
            what: new Chess(fen).turn() == "b" ? "Black" : "White",
            user: " is in check",
          });
        }
        if (new Chess(fen).in_checkmate()) {
          // if(side == new Chess(fen).turn()) {
          //   addElo();
          // } else {
          //   takeElo();
          // }
          db.collection("games").doc(id).update({
            loser: new Chess(fen).turn(),
          })
          setState({
            what: "Checkmate, ",
            user:
              `loser: ` + (new Chess(fen).turn() == "b" ? "black" : "white"),
          });
          if (new Chess(fen).insufficient_material()) {
            setState({
              what: "Insufficient material,",
              user: `no winner`,
            });
          }
          if (new Chess(fen).in_stalemate()) {
            setState({
              what: "Insufficient material,",
              user: `no winner`,
            });
          }
          if (new Chess(fen).in_threefold_repetition()) {
            console.log(new Chess(fen).turn(), new Chess(fen).in_checkmate());
            setState({
              what: "Three fold repition,",
              user: `no winner`,
            });
          }
        }
      });
  }, []);

  useEffect(() => {
    if (ourUser) {
      db.collection("games")
        .doc(id)
        .get()
        .then((doc) => {
          if (
            doc?.data()?.creator == ourUser.email &&
            doc?.data()?.members.length >= 2
          ) {
            let members = doc?.data()?.members;
            let otherUser = members.find(
              (member: any) =>
                member.white !== ourUser.email && member.black !== ourUser.email
            );

            if (otherUser.white) {
              console.log(otherUser.uid);
              db.collection("users")
                .doc(otherUser.uid)
                .get()
                .then((docccc) => {
                  setPlayingAgainst(docccc?.data());
                  console.log(docccc?.data());
                });
            } else if (otherUser.black) {
              console.log(otherUser.uid);
              db.collection("users")
                .doc(otherUser.uid)
                .get()
                .then((docccc) => {
                  setPlayingAgainst(docccc?.data());
                  console.log(docccc?.data());
                });
            }
          }
        });
    }
  }, [ourUser, fen, game]);
  function dropPiece(result: any) {
    console.log(result.piece, side);
    if (result.piece.charAt(0) == side && !waiting) {
      const promotions = game
        .moves({ verbose: true })
        .filter((m: any) => m.promotion);
      let promotionTo = undefined;
      if (
        promotions.some(
          (p: any) =>
            `${p.from}:${p.to}` ==
            `${result.sourceSquare}:${result.targetSquare}`
        )
      ) {
        promotionTo = prompt(
          "Promote your pawn to: r (rook), b (bishop), q (queen), or n (knight)."
        );
        if (
          !(
            promotionTo == "r" ||
            promotionTo == "b" ||
            promotionTo == "q" ||
            promotionTo == "n"
          )
        ) {
          alert(
            "You did not enter a valid promotion to, your pawn will automatically be promoted to a queen."
          );
          promotionTo = "q";
        }
      }
      const legalMove = game.move({
        from: result.sourceSquare,
        to: result.targetSquare,
        promotion: promotionTo,
      });
      if (legalMove) {
        setFen(game.fen());
        setGame(new Chess(game.fen()));
        setState(null);
        db.collection("games").doc(id).update({
          fen: game.fen(),
        });
      }
    }
  }
  function highlight(square: any) {
    let moves = game.moves({ square, verbose: true });
    if (moves.length !== 0) {
      moves.map((move: any) => {
        let highlightable = document.querySelector(
          `[data-squareid="${move.to}"]`
        )! as HTMLElement;
        if (highlightable) {
          highlightable.classList.add("highlighted");
        }
      });
    }
  }
  function dehighlight() {
    document.querySelectorAll("[data-squareid]").forEach((square: any) => {
      square.classList.remove("highlighted");
    });
  }
  return (
    <div className="local">
      <div className="navbar">
        <h2>KGV Chess</h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* <p>{user?.elo} elo (points)</p> */}
          <img
            style={{ marginLeft: "8px" }}
            className="photoURL"
            src={ourUser?.photoURL}
          />
        </div>
      </div>
      <div className="inner">
      {/* <div className="navbar">
	  <h1 style={{textDecoration: "underline"}}>Playing Online</h1>
  	  <h2>Vivaan Chess</h2>
	  <p>Online chess for all...</p>
      <a href="/dashboard">Home</a>
	</div> */}
      {allowed ? (
        <>
          {playingAgainst ? (
            <h3 style={{ display: "flex", marginBottom: "4px" }}>
              <span>Opponent:</span>{" "}
              <img
                style={{ marginLeft: "5px" }}
                className="photoURL"
                src={playingAgainst?.photoURL}
              />{" "}
              <span style={{ marginLeft: "5px" }}>
                {playingAgainst?.displayName}
              </span>
            </h3>
          ) : (
            <></>
          )}
          <p>
            {waiting ? (
              "Waiting for an opponent to join..."
            ) : (
              <>{state ? `${state.what} ${state?.user}` : ""}</>
            )}
          </p>
          {side ?  (
            <ChessBoard
            dropSquareStyle={{}}
            width={400}
            position={fen}
            onDrop={dropPiece}
            onMouseOverSquare={highlight}
            onMouseOutSquare={dehighlight}
            showNotation={true}
            orientation={side == "w" ? "white" : "black"}
          />
          ) : <p>Board loading...</p>}

        </>
      ) : (
        <h2>This game is full and has already started...</h2>
      )}
    </div>

    </div>
  );
}

export default Local;
