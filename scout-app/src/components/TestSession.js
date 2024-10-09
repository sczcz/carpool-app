import React from 'react';

const TestSession = () => {
    const handleTestSession = () => {
        const token = localStorage.getItem('jwt_token');

        if (!token) {
            alert('Ingen token hittades! Logga in först.');
            return;
        }

        fetch('http://127.0.0.1:5000/api/protected', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Åtkomst nekad! Felaktig token eller utgången.');
            }
            return response.json();
        })
        .then(data => {
            alert('Skyddade data: ' + JSON.stringify(data));
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Fel vid begäran: ' + error.message);
        });
    };

    return (
        <div>
            <h2>Testa din session</h2>
            <button onClick={handleTestSession}>Testa session</button>
        </div>
    );
};

export default TestSession;
