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

const socket = io('http://localhost:5000'); // Byt ut med din backend URL

function CarpoolChat({ carpoolId, userName, userId }) {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    console.log("CarpoolChat opened with carpoolId:", carpoolId);
    if (!carpoolId) {
      console.error("carpoolId is missing, unable to load chat");
      return;
    }

    // Hämta historiska meddelanden
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/carpool/${carpoolId}/messages`, {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data); // Spara historiska meddelanden
        } else {
          console.error('Failed to fetch messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();

    // Anslut till chatten och lyssna på nya meddelanden
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

  // Scrolla till botten varje gång `messages` uppdateras
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
          '&::-webkit-scrollbar': {
            display: 'none', // Döljer scrollbaren i Webkit-baserade webbläsare (som Chrome och Safari)
          },
          '-ms-overflow-style': 'none', // Döljer scrollbaren i Internet Explorer och Edge
          'scrollbar-width': 'none', // Döljer scrollbaren i Firefox
        }}
      >
        {messages.length === 0 ? (
          <Text>Inga meddelanden ännu</Text>
        ) : (
          messages.map((msg) => (
            <Flex
              key={`${msg.id}-${msg.timestamp}`}
              justify={msg.sender_name === userName ? 'flex-end' : 'flex-start'}
            >
              <Box
                bg={msg.sender_name === userName ? 'blue.500' : 'gray.200'}
                color={msg.sender_name === userName ? 'white' : 'black'}
                p={3}
                borderRadius="md"
                maxW="70%"
              >
                <Text fontSize="sm" fontWeight="bold">
                  {msg.sender_name}
                </Text>
                <Text>{msg.content}</Text>
              </Box>
            </Flex>
          ))
        )}
        <div ref={messagesEndRef} />
      </VStack>
      <HStack mt={4} p={2}>
        <Input
          placeholder="Type your message..."
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          flex={1}
          bg="white"
        />
        <Button colorScheme="blue" onClick={sendMessage}>
          Send
        </Button>
      </HStack>
    </Flex>
  );
}

export default CarpoolChat;
