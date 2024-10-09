import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();

        fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(`Inloggad! Token: ${data.access_token}`);
                localStorage.setItem('jwt_token', data.access_token);
                // Reset form fields
                setEmail('');
                setPassword('');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <div>
            <h2>Logga in</h2>
            <form onSubmit={handleLogin}>
                <label>E-post:</label>
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                /><br />
                <label>Lösenord:</label>
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                /><br />
                <button type="submit">Logga in</button>
            </form>
        </div>
    );
};

export default Login;
