import React, { useEffect } from 'react'
import { db } from '../Firebase';
const { v4: uuidv4 } = require("uuid");

export default function Dashboard() {
  useEffect(() => {
    if(!localStorage.getItem("email")) {
      window.location.href = "/";
    }
  }, []);
  function createGame () {
    document.getElementById("createGBtn")!.innerText = "Creating game...";
    const id = uuidv4();
    db.collection("games").doc(id).set({
      creator: localStorage.getItem("email"),
      members: [{white: localStorage.getItem("email")}],
      started: true,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    }).then(() => {
      window.location.href = `/games/${id}`;
      document.getElementById("createGBtn")!.innerText = "Loading...";
    })
  }
  return (
    <div className="dashboard">
      <div className="navbar">
        <h1 style={{textDecoration: "underline"}}>Home</h1>
        <h2>Vivaan Chess</h2>
        <p>Online chess for all...</p>
	  </div>
      <h1>Your dashboard {localStorage.getItem("email")}</h1>
      <button onClick={() => window.location.href = "pass-n-play"} className="button">
        Pass n' play
      </button>
      <button className="button">
        Find a random game (coming soon...)
      </button>
      <button id="createGBtn" className="button" onClick={createGame}>
        Create a game with link
      </button>
      <button onClick={() => {localStorage.setItem("email", ""); window.location.href = ""}} className="buttonred">
        Log out of my account
      </button>
    </div>
  )
}
