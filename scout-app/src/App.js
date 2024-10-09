import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import FetchUsers from './components/FetchUsers';
import TestSession from './components/TestSession';
import Logout from './components/Logout';
import Home from './components/Home'; // Importera Home


const App = () => {
  return (
    <Router>
    <Header /> {/* Add your Header component here */}
      <Navbar />
      <Routes>
      <Route path="/" element={<Home />} /> {/* Lägg till Home-rutten */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/FetchUsers" element={<FetchUsers />} />
        <Route path="/TestSession" element={<TestSession />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
};

export default App;
