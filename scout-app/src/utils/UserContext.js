import React, { createContext, useState, useContext, useEffect } from 'react';

// Skapa context
const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Funktion för att hämta användarinformation
  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/protected/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUserId(data.user.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userId, setUserId, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook för enkel åtkomst till context
export const useUser = () => useContext(UserContext);
