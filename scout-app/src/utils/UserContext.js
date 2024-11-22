import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserData = async () => {
    if (isInitialized) return;

    try {
      const response = await fetch('/api/protected/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUserId(data.user.id);
        setFullName(`${data.user.first_name} ${data.user.last_name}`);
        setRole(data.user.role);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsInitialized(true);
      setLoading(false);
    }
  };

  const clearUserData = () => {
    setUserId(null);
    setFullName('');
    setRole('');
    setIsInitialized(false);
    setLoading(false);
  };

  return (
    <UserContext.Provider 
      value={{ 
        userId, 
        setUserId, 
        fullName, 
        role, 
        fetchUserData, 
        loading,
        isInitialized,
        clearUserData }}>
          {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);