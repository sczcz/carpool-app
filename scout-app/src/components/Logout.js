const Logout = () => {
    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        alert('Du har loggats ut!');
    };

    return (
        <div>
            <h2>Logga ut</h2>
            <button onClick={handleLogout}>Logga ut</button>
        </div>
    );
};

export default Logout;
