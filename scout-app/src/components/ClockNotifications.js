import React, { useState, useEffect, useRef } from 'react';
import {
  Flex,
  Text,
  IconButton,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { io } from 'socket.io-client';
import { fetchNotifications } from '../utils/notifications';

const ClockNotifications = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const socketRef = useRef(null); // Store the socket instance
  
    // Handle real-time notifications and fetch initial notifications
    useEffect(() => {
        if (!userId) return;
      
        // Fetch initial notifications and set state
        const loadNotifications = async () => {
          const { notifications: fetchedNotifications, unreadCount: fetchedUnreadCount } = await fetchNotifications();
          console.log('Fetched notifications inside ClockNotifications:', fetchedNotifications);
          setNotifications(fetchedNotifications);
          setUnreadCount(fetchedUnreadCount);
        };
      
        loadNotifications();
      
        // Initialize Socket.IO connection once
        if (!socketRef.current) {
          socketRef.current = io();
        }
      
        const socket = socketRef.current;
      
        // Listen for new notifications
        socket.on('notification', (notification) => {
          console.log('Real-time notification received:', notification);
          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prevCount) => prevCount + 1);
        });
      
        // Cleanup on unmount
        return () => {
          if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
          }
        };
      }, [userId]); // Re-run effect when userId changes
      
  
    // Mark notifications as read
    const markNotificationsAsRead = async () => {
      const unreadNotificationIds = notifications
        .filter((notification) => !notification.is_read)
        .map((notification) => notification.id);
  
      if (unreadNotificationIds.length > 0) {
        try {
          const response = await fetch('/api/notifications/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ notification_ids: unreadNotificationIds }),
          });
          if (response.ok) {
            setUnreadCount(0);
            setNotifications((prevNotifications) =>
              prevNotifications.map((notification) => ({
                ...notification,
                is_read: true,
              }))
            );
          } else {
            console.error('Failed to mark notifications as read');
          }
        } catch (error) {
          console.error('Error marking notifications as read:', error);
        }
      }
    };
  
    return (
        <Flex align="center">
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<BellIcon />}
              variant="outline"
              onClick={markNotificationsAsRead}
            >
              {unreadCount > 0 && (
                <Badge colorScheme="red" ml={-2} mt={-2}>
                  {unreadCount}
                </Badge>
              )}
            </MenuButton>
            <MenuList>
              {console.log('Rendering notifications:', notifications)} {/* Logga notifikationerna */}
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <MenuItem key={index}>
                    <Text>{notification.message}</Text>
                  </MenuItem>
                ))
              ) : (
                <MenuItem>
                  <Text>No new notifications</Text>
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Flex>
      );
      
  };
  
  export default ClockNotifications;
  
