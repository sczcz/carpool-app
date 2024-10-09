import React from 'react';
import Login from './components/Login';
import Register from './components/Register';
import FetchUsers from './components/FetchUsers';
import TestSession from './components/TestSession';
import Logout from './components/Logout';


const App = () => {
    return (
        <div>
            <Login />
            <Register />
            <FetchUsers />
            <TestSession />
            <Logout />
        </div>
    );
};

export default App;
