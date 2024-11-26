import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [roles, setRoles] = useState([]);
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
        setRoles(data.user.roles);
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
    setRoles([]);
    setIsInitialized(false);
    setLoading(false);
  };

  const hasRole = (role) => roles.includes(role);

  return (
    <UserContext.Provider 
      value={{ 
        userId, 
        setUserId, 
        fullName, 
        roles, 
        fetchUserData, 
        loading,
        isInitialized,
        clearUserData,
        hasRole }}>
          {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);