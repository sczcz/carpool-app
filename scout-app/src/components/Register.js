import React, { useState } from 'react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = (e) => {
        e.preventDefault();

        fetch('http://127.0.0.1:5000/api/register', {
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
                alert(data.message);
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
            <h2>Registrera användare</h2>
            <form onSubmit={handleRegister}>
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
                <button type="submit">Registrera</button>
            </form>
        </div>
    );
};

export default Register;
