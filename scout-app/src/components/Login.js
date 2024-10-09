import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

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
                setError(data.error);
            } else {
                alert(`Inloggad! Token: ${data.access_token}`);
                localStorage.setItem('jwt_token', data.access_token);
                setEmail('');
                setPassword('');
                setError('');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Logga in</h2>
            <label>E-post:</label>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
            <label>Lösenord:</label>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
            <button type="submit">Logga in</button>
            {error && <div className="error">{error}</div>}
        </form>
    );
};

export default Login;
