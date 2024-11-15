import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
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


function CarpoolChat({ carpoolId, userName, userId }) {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!carpoolId) {
      console.error("carpoolId saknas, kan inte ladda chatten");
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
          setMessages(data);
        } else {
          console.error('Misslyckades med att hämta meddelanden');
        }
      } catch (error) {
        console.error('Error vid hämtning av meddelanden:', error);
      }
    };
    fetchMessages();

    socket.emit('join_carpool', { carpool_id: parseInt(carpoolId) });
    socket.on('new_message', (data) => {
      if (data.carpool_id === parseInt(carpoolId)) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });

    return () => {
      socket.emit('leave_carpool', { carpool_id: parseInt(carpoolId) });
      socket.off('new_message');
    };
  }, [carpoolId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (userId && messageContent.trim()) {
      socket.emit("send_message", {
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
        spacing={4}
        align="stretch"
        flex={1}
        overflowY="auto"
        p={4}
        bg="white"
        borderRadius="md"
        sx={{
          '&::-webkit-scrollbar': { display: 'none' },
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        }}
      >
        {messages.length === 0 ? (
          <Text>Inga meddelanden ännu</Text>
        ) : (
          messages.map((msg, index) => {
            const showDateSeparator = index === 0 || !isSameDay(new Date(msg.timestamp), new Date(messages[index - 1].timestamp));
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
        <div ref={messagesEndRef} />
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
