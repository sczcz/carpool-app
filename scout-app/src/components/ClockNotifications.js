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


  const loadNotifications = async () => {
    try {
      const { notifications: fetchedNotifications, unreadCount: fetchedUnreadCount } =
        await fetchNotifications();

      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedUnreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  useEffect(() => {
    if (!userId) return;
    socket.emit('join_user', { user_id: userId });
    loadNotifications();

    const handleNotification = (notification) => {

      setNotifications((prevNotifications) => [notification, ...prevNotifications]);
      setUnreadCount((prevCount) => prevCount + 1);
    };

    const updateNotifications = () => {
      loadNotifications();
    };

    socket.on('notification', handleNotification);

  return () => {
    socket.off('notification', handleNotification);
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
  
      if (response.ok) {
        await loadNotifications(); // Anropa loadNotifications för att uppdatera state
      } else {
        console.error('Misslyckades att markera som lästa:', await response.json());
      }
    } catch (error) {
      console.error('Fel vid markering av notifikationer som lästa:', error);
    }
  };
  
  const handleNotificationClick = async (notification) => {
    const carpoolId = notification.carpool_details?.carpool_id;
    if (carpoolId) {
      await markNotificationsForCarpoolAsRead(carpoolId);
      setSelectedCarpoolId(carpoolId);
      onChatOpen();
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
