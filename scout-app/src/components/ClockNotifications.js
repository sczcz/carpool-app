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
  Box,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { fetchNotifications } from '../utils/notifications';
import socket from '../utils/socket';
import { useUser } from '../utils/UserContext';

const ClockNotifications = ({ isScrolled }) => {  // Corrected destructuring here
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
      if (!notification.id) {
        console.error("Invalid notification received (missing id):", notification);
        return;
      }
    
      setNotifications((prev) => {
        // Kontrollera om notifikationen redan finns
        const exists = prev.some((n) => n.id === notification.id);
        if (exists) {
          console.warn("Duplicate notification received:", notification);
          return prev; // Behåll tidigare lista
        }
        return [notification, ...prev];
      });
    
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
        body: JSON.stringify({ id: notificationId }), // Skicka ett enda ID
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
          icon={
            <Box position="relative">
              <BellIcon color={isScrolled ? 'white' : 'brand.500'} />
              {unreadCount > 0 && (
                <Box
                  position="absolute"
                  top="-1px"
                  right="-1px"
                  bg="red.500"
                  w="12px"
                  h="12px"
                  borderRadius="full"
                />
              )}
            </Box>
          }
          variant="ghost"
          _hover={{
            bg: isScrolled ? 'whiteAlpha.300' : 'blackAlpha.200',
          }}
          _active={{
            bg: isScrolled ? 'whiteAlpha.400' : 'blackAlpha.300',
          }}
        >
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              variant="solid"
              position="absolute"
              top="-1"
              right="-1"
              fontSize="0.8em"
            >
              {unreadCount}
            </Badge>
          )}
        </MenuButton>
        <MenuList color="brand.500">
          {notifications.filter(notification => !notification.is_read).length > 0 ? (
            notifications
              .filter(notification => !notification.is_read)
              .map((notification, index) => (
                <MenuItem
                  key={index}
                  _hover={{
                    bg: isScrolled ? 'gray.700' : 'gray.100',
                  }}
                  onClick={() => {
                    if (notification.id) {
                      markSingleNotificationAsRead(notification.id);
                    } else {
                      console.error("Notification ID is missing or undefined in MenuItem onClick:", notification);
                    }
                  }}
                >
                  <Text color="blue.700">{notification.message}</Text>
                </MenuItem>
              ))
          ) : (
            <MenuItem>
              <Text>Inga nya notiser</Text>
            </MenuItem>
          )}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default ClockNotifications;
