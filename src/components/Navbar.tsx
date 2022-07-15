import React from "react";

export default function Navbar() {
  return (
    <div className="navbar">
      <h2>KGV Chess</h2>
      {localStorage.getItem("email") ? (
        <p>Your account</p>
      ) : (
        <p>Sign in to continue</p>
      )}
    </div>
  );
}
