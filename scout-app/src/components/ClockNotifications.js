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
      try {
        const { notifications: fetchedNotifications, unreadCount: fetchedUnreadCount } =
          await fetchNotifications();
    
        // Filtrera endast olästa notiser från backend
        const unreadNotifications = fetchedNotifications.filter((n) => !n.is_read);
    
        console.log('Olästa notiser från backend:', unreadNotifications);
    
        // Anropa handleNotification för varje oläst notis
        unreadNotifications.forEach((notification) => handleNotification(notification));
    
        // Uppdatera det totala antalet olästa
        setUnreadCount(fetchedUnreadCount);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    const handleNotification = (notification) => {
      if (!notification.id) {
        console.error('Invalid notification received (missing id):', notification);
        return;
      }

      // Lägg till inkommande notis om den inte redan finns
      setNotifications((prevNotifications) => {
        const exists = prevNotifications.some((n) => n.id === notification.id);
        if (!exists) {
          return [notification, ...prevNotifications];
        }
        return prevNotifications;
      });
      

      // Öka antalet olästa notiser
      setUnreadCount((prevCount) => prevCount + 1);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [userId]);

  const markNotificationsForCarpoolAsRead = (carpoolId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter(
        (notification) => notification.carpool_details?.carpool_id !== carpoolId
      )
    );

    // Uppdatera antalet olästa notiser
    setUnreadCount((prevCount) =>
      Math.max(
        prevCount -
          notifications.filter((n) => n.carpool_details?.carpool_id === carpoolId).length,
        0
      )
    );
  };

  const handleNotificationClick = (notification) => {
    const carpoolId = notification.carpool_details?.carpool_id;
    if (carpoolId) {
      setSelectedCarpoolId(carpoolId);
      onChatOpen();
      markNotificationsForCarpoolAsRead(carpoolId);
    }
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const carpoolId = notification.carpool_details?.carpool_id;
    if (!carpoolId) return acc;

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
