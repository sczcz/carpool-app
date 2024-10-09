import React, { useState } from 'react';

const FetchUsers = () => {
    const [users, setUsers] = useState([]);

    const handleFetchUsers = () => {
        fetch('http://127.0.0.1:5000/api/users')
        .then(response => response.json())
        .then(data => setUsers(data))
        .catch(error => console.error('Error:', error));
    };

    return (
        <div>
            <h2>Hämta alla användare</h2>
            <button onClick={handleFetchUsers}>Hämta användare</button>
            <ul>
                {users.map(user => (
                    <li key={user.id}>
                        ID: {user.id}, E-post: {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FetchUsers;
