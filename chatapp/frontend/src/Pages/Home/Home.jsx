import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Ensure the correct path to your firebase config
import { addDoc, collection, query, onSnapshot, doc, setDoc, updateDoc, arrayUnion, getDoc, where, getDocs } from 'firebase/firestore';
import './Home.css';
import { useLocation, useNavigate } from 'react-router-dom';

const Home = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const currentUserId = location.state.uniqueId;
  const [currentUserName, setCurrentUserName] = useState('');
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  const toggleUserList = () => setIsUserListOpen(!isUserListOpen);

  useEffect(() => {
    if (!currentUserId) navigate('/');
    const fetchUserName = async () => {
      const userDoc = await getDoc(doc(db, "users", currentUserId));
      if (userDoc.exists()) setCurrentUserName(userDoc.data().name);
    };
    fetchUserName();
  }, [navigate, currentUserId]);

  useEffect(() => {
    const fetchChatHistory = () => {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chats = [];
        querySnapshot.forEach((doc) => {
          chats.push({ id: doc.id, ...doc.data() });
        });
        setChatHistory(chats);
      });
      return () => unsubscribe();
    };
    fetchChatHistory();
  }, []);

  useEffect(() => {
    const fetchUsers = () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef);
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const usersList = [];
        const namesDict = {};
        querySnapshot.forEach((doc) => {
          if (doc.id !== currentUserId) {
            const userData = { id: doc.id, ...doc.data() };
            usersList.push(userData);
            namesDict[doc.id] = userData.name;
          }
        });
        setUsers(usersList);
        setFilteredUsers(usersList);
        setUserNames(namesDict);
      });
      return () => unsubscribe();
    };
    fetchUsers();
  }, [currentUserId]);

  const getOrCreateChat = async (otherUserId) => {
    const chatQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUserId)
    );

    const querySnapshot = await getDocs(chatQuery);
    let existingChat = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(otherUserId)) {
        existingChat = { id: doc.id, ...data };
      }
    });

    if (existingChat) {
      setSelectedChat(existingChat);
    } else {
      const newChatRef = await addDoc(collection(db, "chats"), {
        participants: [currentUserId, otherUserId],
        messages: []
      });
      setSelectedChat({ id: newChatRef.id, participants: [currentUserId, otherUserId], messages: [] });
    }
  };

  useEffect(() => {
    setFilteredUsers(
      users.filter(user => user.id.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, users]);

  useEffect(() => {
    if (selectedChat) {
      const chatDoc = doc(db, "chats", selectedChat.id);
      const unsubscribe = onSnapshot(chatDoc, (doc) => {
        if (doc.exists()) {
          setMessages(doc.data().messages || []);
        }
      });
      return () => unsubscribe();
    }
  }, [selectedChat]);

  const handleSelectChat = (chat) => setSelectedChat(chat);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedChat) return;

    try {
      const chatDocRef = doc(db, "chats", selectedChat.id);

      await updateDoc(chatDocRef, {
        messages: arrayUnion({
          from: currentUserId,
          text: newMessage,
          timestamp: new Date()
        })
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const Message = ({ msg }) => {
    const formattedTime = msg.timestamp ? msg.timestamp.toDate().toLocaleString() : '';
    const senderName = msg.from === currentUserId ? "You" : userNames[msg.from] || msg.from;

    return (
      <div className={`message ${msg.from === currentUserId ? "sent" : "received"}`}>
        {msg.text} <small className='time-p'>{formattedTime}</small>
      </div>
    );
  };

  return (
    <div className="chat-container">
      {/* <div className="user-list">
        <button onClick={toggleUserList} className="toggle-user-list-btn">
          {isUserListOpen ? 'Hide Users' : 'Show Users'}
        </button>
        {isUserListOpen && (
          <>
            <h3>Users</h3>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="user-item"
                onClick={() => getOrCreateChat(user.id)}
              >
                {userNames[user.id] || user.id}
              </div>
            ))}
          </>
        )}
      </div> */}

      <div className="chat-list-div">
        <div className="chat-list">
          <h3>Chat History</h3>
          {chatHistory.map((chat) => (
            <div key={chat.id} className="chat-item" onClick={() => handleSelectChat(chat)}>
              <h4>
                {chat.participants.filter((id) => id !== currentUserId).map((id) => userNames[id] || id).join(', ')}
              </h4>
              <p>{chat.messages.length > 0 ? chat.messages.slice(-1)[0].text : "No messages yet"}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="chat-window-div">
        <div className="chat-window">
          {selectedChat ? (
            <>
              <h3 className="chat-window-h3">
                Chat with {selectedChat.participants.filter(id => id !== currentUserId).map(id => userNames[id] || id).join(', ')}
              </h3>
              <div className="messages">
                {messages.map((msg, index) => (
                  <Message key={index} msg={msg} />
                ))}
              </div>
              <div className="message-input-container">
                <input
                  type="text"
                  className="message-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button className="send-button" onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <p>Select a user to start a chat</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
