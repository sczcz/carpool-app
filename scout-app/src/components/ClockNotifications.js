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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { fetchNotifications } from '../utils/notifications';
import socket from '../utils/socket';
import { useUser } from '../utils/UserContext';
import CarpoolChat from './CarpoolChat';

const ClockNotifications = ({ isScrolled }) => {
  const [notifications, setNotifications] = useState([]); // Alla notiser
  const [unreadCount, setUnreadCount] = useState(0); // Antal olästa notiser
  const { userId, fullName } = useUser();
  const [selectedCarpoolId, setSelectedCarpoolId] = useState(null);

  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();

  useEffect(() => {
    if (!userId) return;

    // Anslut till användarens socket-kanal
    socket.emit('join_user', { user_id: userId });

    // Ladda notiser från backend
    const loadNotifications = async () => {
      try {
        const { notifications: fetchedNotifications, unreadCount: fetchedUnreadCount } =
          await fetchNotifications();

        // Uppdatera state med alla notiser
        setNotifications(fetchedNotifications);
    
        setUnreadCount(fetchedUnreadCount);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    // Hantera inkommande realtidsnotiser
    const handleNotification = (notification) => {

      // Lägg till den nya notisen och uppdatera state
      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      setUnreadCount((prevCount) => prevCount + 1);
    };

    // Uppdatera notiser vid ändringar från backend
    const updateNotifications = () => {
      loadNotifications();
    };

    socket.on('notification', handleNotification);
    socket.on('update_notifications', updateNotifications);

  return () => {
    socket.off('notification', handleNotification);
    socket.off('update_notifications', updateNotifications);
  };
  }, [userId]);

  const markNotificationsForCarpoolAsRead = async (carpoolId) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ carpool_id: carpoolId }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
  
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.carpool_details?.carpool_id === carpoolId
              ? { ...notification, is_read: true }
              : notification
          )
        );
  
        setUnreadCount((prevCount) =>
          Math.max(
            prevCount -
              notifications.filter(
                (n) => n.carpool_details?.carpool_id === carpoolId && !n.is_read
              ).length,
            0
          )
        );
      } else {
        console.error('Misslyckades att markera som läst:', result);
      }
    } catch (error) {
      console.error('Fel vid markering av notiser som lästa:', error);
    }
  };
  

  const handleNotificationClick = (notification) => {
    const carpoolId = notification.carpool_details?.carpool_id;
    if (carpoolId) {
      setSelectedCarpoolId(carpoolId);
      onChatOpen();
      markNotificationsForCarpoolAsRead(carpoolId);
    }
  };

  // Gruppar notiser för visning
  const groupedNotifications = notifications
  .filter((notification) => !notification.is_read) // Filtrera bort lästa notiser
  .reduce((acc, notification) => {
    const carpoolId = notification.carpool_details?.carpool_id || 'unknown'; // Hantera saknade carpool_id

    if (!acc[carpoolId]) {
      acc[carpoolId] = { ...notification, count: 0 };
    }
    acc[carpoolId].count += 1;

    return acc;
  }, {});

  

  const displayedNotifications = Object.values(groupedNotifications);

  return (
    <>
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
            {displayedNotifications.length > 0 ? (
              displayedNotifications.map((notification, index) => (
                <MenuItem
                  key={index}
                  _hover={{
                    bg: isScrolled ? 'gray.700' : 'gray.100',
                  }}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <Text color="blue.700">
                    {notification.count === 1
                      ? `Ett nytt ${notification.message}`
                      : `${notification.count} nya ${notification.message}`}
                  </Text>
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
      <Modal isOpen={isChatOpen} onClose={onChatClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Carpool Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CarpoolChat carpoolId={selectedCarpoolId} userName={fullName} userId={userId} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ClockNotifications;
