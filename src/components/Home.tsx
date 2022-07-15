import React, { useEffect } from "react";
import { auth, provider, db } from "../Firebase";
import Navbar from "./Navbar";

export default function Home() {
  useEffect(() => {
    if (localStorage.getItem("email")) {
      window.location.href = "/dashboard";
    }
  }, []);
  
  const signIn = async() => {
    auth.signInWithPopup(provider).then((result) => {
      const user = result.user;
      const uid = user?.uid;
      localStorage.setItem("email", `${user?.uid}`);
      db
        .collection("users")
        .doc(uid)
        .get()
        .then(async (doc) => {
          if (doc.exists) {
            window.location.href = "/dashboard";
          } else {
            db.collection("users").doc(uid).set({
              displayName: user?.displayName,
              email: user?.email,
              photoURL: user?.photoURL,
              elo: 1000,
            }).then(() => {
              window.location.href = "/dashboard";
            })
          }
        });
      
    });
  }
  return (
    <div className="home">
      <Navbar/>
      <div className="inner">
        {/* <div className="navbar">
        <h1 style={{textDecoration: "underline"}}>Home</h1>
        <h2>Vivaan Chess</h2>
        <p>Online chess for all...</p>
        <a href="/dashboard">Home</a>
	    </div> */}
        <h1>KGV Chess</h1>
        <button onClick={signIn} className="button">
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
