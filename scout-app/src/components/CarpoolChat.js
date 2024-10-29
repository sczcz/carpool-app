import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your backend URL

socket.on("connect", () => {
  console.log("Socket.IO connected:", socket.id);
});

socket.on("new_message", (message) => {
  console.log("New message received:", message);
});

function CarpoolChat({ carpoolId }) {
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState('');
  const [userId, setUserId] = useState(null);

  // Hämta användarens ID från backend vid komponentens start
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/user/id', {
          method: 'GET',
          credentials: 'include',  // Skicka med cookies
        });
        if (response.ok) {
          const data = await response.json();
          setUserId(data.user_id);  // Spara användar-ID i state
        } else {
          console.error('Failed to fetch user ID');
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    // Join the carpool chat
    socket.emit('join_carpool', { carpool_id: carpoolId });

    // Listen for new messages
    socket.on('new_message', (data) => {
      if (data.carpool_id === carpoolId) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });

    // Leave the carpool chat on cleanup
    return () => {
      socket.emit('leave_carpool', { carpool_id: carpoolId });
    };
  }, [carpoolId]);

  // Skicka meddelande med användarens ID inkluderat
  const sendMessage = () => {
    if (userId && messageContent.trim()) {
      socket.emit("send_message", { 
        carpool_id: carpoolId, 
        content: messageContent, 
        sender_id: userId 
      });
      setMessageContent(''); // Rensa meddelandefältet efter att ha skickat
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg) => (
          <p key={msg.id}>{msg.content}</p>
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
