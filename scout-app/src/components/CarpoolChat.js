import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { format, isSameDay } from 'date-fns';
import socket from '../utils/socket';
import { useCarpool } from '../utils/CarpoolContext';
import { useUser } from '../utils/UserContext';

function CarpoolChat() {
  const {
    selectedCarpoolId : carpoolId,
  } = useCarpool();
  const {
    userId,
    fullName: userName
  } = useUser();
  const [allMessages, setAllMessages] = useState([]);
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [messagesToShow, setMessagesToShow] = useState(10);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const maintainScrollPosition = (prevScrollHeight) => {
    if (messagesContainerRef.current) {
      const currentScrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollTop + (currentScrollHeight - prevScrollHeight);
    }
  };

  useEffect(() => {
    if (!carpoolId || !userId) {
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/carpool/${carpoolId}/messages`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          const sortedData = data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          setAllMessages(sortedData);
          setVisibleMessages(sortedData.slice(-messagesToShow));
          setHasMoreMessages(sortedData.length > messagesToShow);
          scrollToBottom();
        } else {
          console.error('Misslyckades med att hämta meddelanden');
        }
      } catch (error) {
        console.error('Fel vid hämtning av meddelanden:', error);
      }
    };

    const markNotificationsAsRead = async () => {
      try {
        const response = await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ carpool_id: carpoolId, type: 'chat' }),
        });
        if (!response.ok) {
          console.error('Misslyckades med att markera notifikationer som lästa');
        }
      } catch (error) {
        console.error('Error vid markering av notifikationer som lästa:', error);
      }
    };

    fetchMessages();
    markNotificationsAsRead();

    socket.emit('join_carpool', { carpool_id: parseInt(carpoolId), user_id: userId });
    socket.on('new_message', (data) => {
      if (data.carpool_id === parseInt(carpoolId)) {
        setAllMessages((prevMessages) => [...prevMessages, data.message]);
        setVisibleMessages((prevVisible) => [...prevVisible, data.message]);
        setTimeout(scrollToBottom, 0);
      }
    });

    return () => {
      socket.emit('leave_carpool', { carpool_id: parseInt(carpoolId), user_id: userId });
      socket.off('new_message');
    };
  }, [carpoolId, userId]);

  const handleScroll = () => {
    if (messagesContainerRef.current.scrollTop === 0 && hasMoreMessages) {
      const prevScrollHeight = messagesContainerRef.current.scrollHeight;
      const newMessagesToShow = messagesToShow + 10;
      const newVisibleMessages = allMessages.slice(-newMessagesToShow);

      setMessagesToShow(newMessagesToShow);
      setVisibleMessages(newVisibleMessages);
      setHasMoreMessages(allMessages.length > newMessagesToShow);
      setTimeout(() => maintainScrollPosition(prevScrollHeight), 0);
    }
  };

  const sendMessage = () => {
    if (userId && messageContent.trim()) {
      socket.emit('send_message', {
        carpool_id: parseInt(carpoolId),
        content: messageContent,
        sender_id: userId,
        sender_name: userName,
      });
      setMessageContent('');
    }
  };

  return (
    <Flex direction="column" maxW="800px" h="600px" bg="gray.100" p={4} borderRadius="md" boxShadow="lg">
      <VStack
        ref={messagesContainerRef}
        spacing={4}
        align="stretch"
        flex={1}
        overflowY="auto"
        p={4}
        bg="white"
        borderRadius="md"
        onScroll={handleScroll}
        sx={{
          '&::-webkit-scrollbar': { display: 'none' },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        }}
      >
        {visibleMessages.length === 0 ? (
          <Text>Inga meddelanden ännu</Text>
        ) : (
          visibleMessages.map((msg, index) => {
            const showDateSeparator =
              index === 0 || !isSameDay(new Date(msg.timestamp), new Date(visibleMessages[index - 1]?.timestamp));
            return (
              <div key={`${msg.id}-${msg.timestamp}`}>
                {showDateSeparator && (
                  <Text fontSize="sm" fontWeight="bold" textAlign="center" my={2}>
                    {format(new Date(msg.timestamp), 'd MMMM yyyy')}
                  </Text>
                )}
                <Flex justify={msg.sender_name === userName ? 'flex-end' : 'flex-start'}>
                  <Box
                    bg={msg.sender_name === userName ? 'blue.500' : 'gray.200'}
                    color={msg.sender_name === userName ? 'white' : 'black'}
                    p={3}
                    borderRadius="md"
                    maxW="70%"
                    mb={1}
                  >
                    <Text fontSize="sm" fontWeight="bold">{msg.sender_name}</Text>
                    <Text>{msg.content}</Text>
                    <Text fontSize="xs" color="black.500" mt={1} textAlign="right">
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </Text>
                  </Box>
                </Flex>
              </div>
            );
          })
        )}
      </VStack>
      <HStack mt={4} p={2}>
        <Input
          placeholder="Skriv ditt meddelande..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          flex={1}
          bg="white"
        />
        <Button colorScheme="blue" onClick={sendMessage}>
          Skicka
        </Button>
      </HStack>
    </Flex>
  );
}

export default CarpoolChat;
