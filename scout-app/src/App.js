import React from 'react';
import './App.css'; 
import Login from './components/Login';
import Register from './components/Register';
import FetchUsers from './components/FetchUsers';
import TestSession from './components/TestSession';
import Logout from './components/Logout';
import Header from './components/Header'; // Importera Header-komponenten

const App = () => {
    return (
        <div>
            <Header /> {/* Lägg till Header-komponenten här */}
            <Login />
            <Register />
            <FetchUsers />
            <TestSession />
            <Logout />
        </div>
    );
};

export default App;