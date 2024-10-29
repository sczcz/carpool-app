import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useLocation } from 'react-router-dom';

const socket = io('http://localhost:5000'); // Byt ut med din backend URL

function CarpoolChat() {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const carpoolId = queryParams.get('carpoolId'); // Hämtar carpoolId från URL-query

  useEffect(() => {
    console.log("Carpool ID from query:", carpoolId);
  }, [carpoolId]);

  // Hämta användarens ID och namn från backend vid komponentens start
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/protected/user', {
          method: 'GET',
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserId(data.user.id);
          setUserName(`${data.user.first_name} ${data.user.last_name}`);
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    };
    fetchUserInfo();
  }, []);

  // Hämta historiska meddelanden för carpoolen när komponenten laddas
  useEffect(() => {
    if (carpoolId) {
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/carpool/${carpoolId}/messages`, {
            method: 'GET',
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setMessages(data); // Spara historiska meddelanden i state
          } else {
            console.error('Failed to fetch messages');
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [carpoolId]);

  // Anslut till carpool-chatten och lyssna på nya meddelanden
  useEffect(() => {
    if (carpoolId) {
      socket.emit('join_carpool', { carpool_id: parseInt(carpoolId) });
      console.log("Joined room:", carpoolId);

      socket.on('new_message', (data) => {
        if (data.carpool_id === parseInt(carpoolId)) {
          setMessages((prevMessages) => [...prevMessages, data.message]);
        }
      });

      return () => {
        socket.emit('leave_carpool', { carpool_id: parseInt(carpoolId) });
        socket.off('new_message');
        console.log("Left room:", carpoolId);
      };
    }
  }, [carpoolId]);

  // Skicka meddelande med användarens ID och namn inkluderat
  const sendMessage = () => {
    if (userId && messageContent.trim()) {
      socket.emit("send_message", {
        carpool_id: parseInt(carpoolId),
        content: messageContent,
        sender_id: userId,
        sender_name: userName,
      });
      setMessageContent(''); // Rensa meddelandefältet efter att ha skickat
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg) => (
          <p key={`${msg.id}-${msg.timestamp}`}>
            <strong>{msg.sender_name || "Unknown"}: </strong>{msg.content}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default CarpoolChat;
