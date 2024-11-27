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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { userId, fullName } = useUser();
  const [selectedCarpoolId, setSelectedCarpoolId] = useState(null);

  const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();

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
        console.error('Invalid notification received (missing id):', notification);
        return;
      }

      setNotifications((prev) => {
        // Lägg till notisen i listan
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
        body: JSON.stringify({ id: notificationId }),
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

  const markNotificationsForCarpoolAsRead = async (carpoolId) => {
    // Uppdatera state för att ta bort notiser för detta carpool_id
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.carpool_details?.carpool_id !== carpoolId
      )
    );

    // Uppdatera räknaren för olästa notiser
    setUnreadCount((prevCount) =>
      Math.max(
        prevCount -
          notifications.filter(
            (notification) =>
              notification.carpool_details?.carpool_id === carpoolId
          ).length,
        0
      )
    );
  };
  
  const handleNotificationClick = (notification) => {
    const carpoolId = notification.carpool_details?.carpool_id;
    if (carpoolId) {
      setSelectedCarpoolId(carpoolId); // Sätt vilket samåknings-ID som ska visas
      onChatOpen(); // Öppna chatmodulen
      markNotificationsForCarpoolAsRead(carpoolId); // Ta bort alla notiser för denna carpool
    }
  };
  

  // Filtrera unika notiser baserat på `carpool_id`
  const uniqueNotifications = notifications.reduce((acc, notification) => {
    if (!notification.carpool_details?.carpool_id) return acc;

    // Om en notis för denna `carpool_id` redan finns, ersätt den
    acc[notification.carpool_details.carpool_id] = notification;

    return acc;
  }, {});

  // Konvertera objekt till array
  const displayedNotifications = Object.values(uniqueNotifications);

  return (
    <>
      <Flex align="center">
        <Menu>
        <MenuButton
  as={IconButton}
  icon={
    <Box position="relative">
      <BellIcon color={isScrolled ? 'white' : 'brand.500'} />
      {/* Visa endast pricken om det finns notiser */}
      {displayedNotifications.length > 0 && (
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
  {/* Visa antalet olästa notiser som badge endast om det finns några */}
  {displayedNotifications.length > 0 && (
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
                  onClick={() => {
                    markSingleNotificationAsRead(notification.id);
                    handleNotificationClick(notification);
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
      {/* Modal för Carpool Chat */}
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
