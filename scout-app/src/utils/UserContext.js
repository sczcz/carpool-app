import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [roles, setRoles] = useState([]);
  const [address, setAddress] = useState(''); 
  const [postcode, setPostcode] = useState(''); 
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [notificationPreferences, setNotificationPreferences] = useState({}); 
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
        const user = data.user;

        setUserId(user.id);
        setEmail(user.email);
        setFullName(`${user.first_name} ${user.last_name}`);
        setRoles(user.roles);
        setAddress(user.address || '');
        setPostcode(user.postcode || '');
        setCity(user.city || '');
        setPhone(user.phone || '');
        setIsAccepted(user.is_accepted);

        const preferences = user.notification_preferences || {};
        setNotificationPreferences(preferences);
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
    setAddress('');
    setPostcode('');
    setCity('');
    setPhone('');
    setNotificationPreferences({})
    setIsInitialized(false);
    setLoading(false);
    setIsAccepted(false);
  };

  const updateUserData = (updatedData) => {
    if (updatedData.firstName && updatedData.lastName) {
      setFullName(`${updatedData.firstName} ${updatedData.lastName}`);
    }
    if (updatedData.address) setAddress(updatedData.address);
    if (updatedData.postcode) setPostcode(updatedData.postcode);
    if (updatedData.city) setCity(updatedData.city);
    if (updatedData.phone) setPhone(updatedData.phone);
    if (updatedData.notificationPreferences) {
      setNotificationPreferences(updatedData.notificationPreferences);
    }
  };

  const hasRole = (role) => roles.includes(role);

  return (
    <UserContext.Provider 
      value={{ 
        userId, 
        setUserId,
        email, 
        fullName, 
        roles, 
        address, 
        postcode, 
        city, 
        phone,
        notificationPreferences,
        setNotificationPreferences,
        isAccepted, 
        fetchUserData, 
        loading,
        isInitialized,
        clearUserData,
        updateUserData,
        hasRole }}>
          {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);