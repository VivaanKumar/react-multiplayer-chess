import React, { useEffect } from 'react'
import { auth, provider } from '../Firebase'

export default function Home() {
  useEffect(() => {
    if(localStorage.getItem("email")) {
      window.location.href = "/dashboard";
    }
  }, [])
  function signIn () {
    auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      const email = user?.email;
      localStorage.setItem("email", `${email}`);
      window.location.href = "/dashboard";
    })
  }
  return (
    <div className="home">
      <div className="navbar">
        <h1 style={{textDecoration: "underline"}}>Home</h1>
        <h2>Vivaan Chess</h2>
        <p>Online chess for all...</p>
        <a href="/dashboard">Home</a>
	    </div>
      <h1>Traditional chess made online</h1>
      <button onClick={signIn} className="button">Sign in with Google</button>
    </div>
  )
}
