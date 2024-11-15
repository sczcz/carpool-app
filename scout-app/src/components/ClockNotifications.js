import React, { useState, useEffect } from 'react';
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
import { fetchNotifications } from '../utils/notifications';
import socket from '../utils/socket';
import { useUser } from '../utils/UserContext';

const ClockNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { userId } = useUser();

  useEffect(() => {
    if (!userId) return;

    socket.emit('join_user', { user_id: userId });

    const loadNotifications = async () => {
      const { notifications: fetchedNotifications, unreadCount: fetchedUnreadCount } = await fetchNotifications();
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedUnreadCount);
    };

    loadNotifications();

    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prevCount) => prevCount + 1);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [userId]);
      
  const markSingleNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notification_ids: [notificationId] }),
      });
      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.id === notificationId ? { ...notification, is_read: true } : notification
          )
        );
        setUnreadCount((prevCount) => Math.max(prevCount - 1, 0));
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  return (
    <Flex align="center">
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<BellIcon />}
          variant="outline"
        >
          {unreadCount > 0 && (
            <Badge colorScheme="red" ml={-2} mt={-2}>
              {unreadCount}
            </Badge>
          )}
        </MenuButton>
        <MenuList>
          {console.log('Rendering notifications:', notifications)} {/* Logga notifikationerna */}
          {notifications.filter(notification => !notification.is_read).length > 0 ? (
            notifications
              .filter(notification => !notification.is_read) // Endast olästa notiser
              .map((notification, index) => (
                <MenuItem
                  key={index}
                  onClick={() => markSingleNotificationAsRead(notification.id)}
                >
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
