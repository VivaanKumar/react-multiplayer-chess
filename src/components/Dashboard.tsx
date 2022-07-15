import React, { useEffect, useState } from "react";
import { db } from "../Firebase";
import Navbar from "./Navbar";
const { v4: uuidv4 } = require("uuid");

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const uid = localStorage.getItem("email")
      ? localStorage.getItem("email")
      : null;
    if (uid) {
      db.collection("users")
        .doc(uid)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            window.location.href = "/";
          }
          setUser(doc.data());
          console.log(doc.data());
        });
    } else {
      window.location.href = "/";
    }
  }, []);
  function createGame() {
    document.getElementById("createGBtn")!.innerText = "Creating game...";
    const id = uuidv4();
    db.collection("games")
      .doc(id)
      .set({
        creator: user?.email,
        creatorUid: localStorage.getItem("email"),
        members: [{ white: user?.email, uid: localStorage.getItem("email") }],
        started: true,
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      })
      .then(() => {
        window.location.href = `/games/${id}`;
        document.getElementById("createGBtn")!.innerText = "Loading...";
      });
  }
  return (
    <div className="dashboard">
      <div className="navbar">
        <h2>KGV Chess</h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* <p>{user?.elo} elo (points)</p> */}
          <img
            style={{ marginLeft: "8px" }}
            className="photoURL"
            src={user?.photoURL}
          />
        </div>
      </div>
      <div className="inner">
        <div
          style={{ display: "flex", flexDirection: "column", width: "450px" }}
        >
          <h3>Play online</h3>
          <button className="button">
            Find a random game (coming soon...)
          </button>
          <button id="createGBtn" className="button" onClick={createGame}>
            Create a game with link
          </button>
          <br />
          <h3>Play offline</h3>
          <button
            onClick={() => (window.location.href = "pass-n-play")}
            className="button"
          >
            Pass n' play
          </button>
          <br></br>
          <h3>Settings</h3>
          <button
            onClick={() => {
              localStorage.setItem("email", "");
              window.location.href = "";
            }}
            className="button"
            style={{ backgroundColor: "black", color: "white" }}
          >
            Log out of my account
          </button>
        </div>
      </div>
    </div>
  );
}
