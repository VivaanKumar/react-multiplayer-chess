import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Game from './components/Game';
import Home from './components/Home';
import Local from "./components/Local";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/pass-n-play" element={<Local/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>        
        <Route path="/games/:id" element={<Game/>}/>
        <Route path="/" element={<Home/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
