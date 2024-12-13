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
import CarpoolDetails from './CarpoolDetails';
import { useCarpool } from '../utils/CarpoolContext';

const ClockNotifications = ({ isScrolled }) => {
  const {
    activities,
    isDetailsOpen,
    setDetailsOpen,
    selectedActivity,
    selectedCarpool,
    onDetailsOpen,
    onDetailsClose,
    setSelectedActivity,
    setSelectedCarpool,
    fetchCarpoolsForActivity
  } = useCarpool();
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
        setNotifications(fetchedNotifications);
    
        setUnreadCount(fetchedUnreadCount);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();

    const handleNotification = (notification) => {
      
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

  const markNotificationsForCarpoolAsRead = async (carpoolId, type) => {
    try {
      const response = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ carpool_id: carpoolId, type }), // Skicka med type
      });
      const result = await response.json();
  
      if (response.ok) {
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) =>
            notification.carpool_details?.id === carpoolId && notification.type === type
              ? { ...notification, is_read: true }
              : notification
          )
        );
  
        setUnreadCount((prevCount) =>
          Math.max(
            prevCount -
              notifications.filter(
                (n) =>
                  n.carpool_details?.id === carpoolId &&
                  n.type === type &&
                  !n.is_read
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
  
  

  const handleNotificationClick = async (notification) => {
    const carpoolId = notification.carpool_details?.id;
  
    if (!carpoolId) {
      console.error('Carpool ID saknas i notifikationen:', notification);
      return;
    }
  
    try {
      const response = await fetch(`/api/protected/activity/by_carpool/${carpoolId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
  
      if (response.ok) {
        const data = await response.json();
  
        setSelectedActivity(data.activity);
        setSelectedCarpool(data.carpool);
  
        if (notification.type === 'chat') {
          setSelectedCarpoolId(carpoolId);
          onChatOpen();
        } else if (notification.type === 'passenger') {
          onDetailsOpen();
        } else {
          console.error('Okänd typ av notis:', notification);
        }
        markNotificationsForCarpoolAsRead(carpoolId, notification.type);
      } else {
        console.error('Misslyckades att hämta aktivitetsdetaljer:', response.statusText);
      }
    } catch (error) {
      console.error('Fel vid hämtning av aktivitetsdetaljer:', error);
    }
  };
  
  
  

  const closeDetails = () => {
    setDetailsOpen(false);
  };

  // Gruppar notiser för visning
  const groupedNotifications = notifications
  .filter((notification) => !notification.is_read)
  .reduce((acc, notification) => {
    const carpoolId = notification.carpool_details?.id || 'unknown';
    const type = notification.type || 'unknown';

    const key = `${carpoolId}_${type}`; // Använd både carpoolId och typ som nyckel

    if (!acc[key]) {
      acc[key] = { ...notification, count: 0 };
    }
    acc[key].count += 1;

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
                  {notification.type === 'chat' ? (
                    notification.count === 1
                      ? `Ett nytt ${notification.message}`
                      : `${notification.count} nya ${notification.message}`
                  ) : (
                    // För andra typer av notiser, visa endast meddelandet
                    notification.message
                  )}
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
