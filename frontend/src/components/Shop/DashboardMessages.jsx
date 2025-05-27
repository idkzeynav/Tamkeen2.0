import axios from "axios";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineSend, AiOutlineArrowLeft, AiOutlineTranslation } from "react-icons/ai";
import styles from "../../styles/styles";
import { TfiGallery } from "react-icons/tfi";
import socketIO from "socket.io-client";
import moment from "moment";

const ENDPOINT = "http://localhost:4000/";
let socket;

const DashboardMessages = () => {
  const { seller } = useSelector((state) => state.seller);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeStatus, setActiveStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTranslated, setShowTranslated] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket = socketIO(ENDPOINT, {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socket.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        translatedText: data.translatedText,
        images: data.images,
        createdAt: Date.now(),
      });
    });

    return () => {
      socket.off('getMessage');
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
      updateLastMessage(arrivalMessage.text || 'Photo');
    }
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-seller/${seller?._id}`,
          { withCredentials: true }
        );

        const conversationsWithData = await Promise.all(
          response.data.conversations.map(async (conv) => {
            const userId = conv.members.find(id => id !== seller._id);
            try {
              const userRes = await axios.get(`${server}/user/user-info/${userId}`);
              return {
                ...conv,
                userName: userRes.data.user?.name,
                userAvatar: userRes.data.user?.avatar,
              };
            } catch (err) {
              return conv;
            }
          })
        );

        setConversations(conversationsWithData);
      } catch (error) {
        setError('Failed to load conversations');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getConversation();
  }, [seller, messages]);

  useEffect(() => {
    const getMessage = async () => {
      try {
        if (currentChat?._id) {
          setLoading(true);
          const response = await axios.get(
            `${server}/message/get-all-messages/${currentChat._id}`
          );
          setMessages(response.data.messages);
        }
      } catch (error) {
        setError('Failed to load messages');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getMessage();
  }, [currentChat]);

  useEffect(() => {
    if (seller?._id) {
      socket.emit("addUser", seller._id);
      socket.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }

    return () => {
      socket.off("getUsers");
    };
  }, [seller]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    const message = {
      sender: seller._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(member => member !== seller._id);

    try {
      socket.emit("sendMessage", {
        senderId: seller._id,
        receiverId,
        text: newMessage,
      });

      const res = await axios.post(
        `${server}/message/create-new-message`,
        message,
        { withCredentials: true }
      );

      setMessages([...messages, res.data.message]);
      updateLastMessage(newMessage);
      setNewMessage("");
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentChat) return;

    const formData = new FormData();
    formData.append('images', file);
    formData.append('sender', seller._id);
    formData.append('conversationId', currentChat._id);

    const receiverId = currentChat.members.find(member => member !== seller._id);

    try {
      const res = await axios.post(
        `${server}/message/create-new-message`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );

      socket.emit("sendMessage", {
        senderId: seller._id,
        receiverId,
        images: res.data.message.images,
      });

      setMessages([...messages, res.data.message]);
      updateLastMessage('Photo');
    } catch (err) {
      console.error('Failed to upload image:', err);
      setError('Failed to upload image');
    }
  };

  const updateLastMessage = async (message) => {
    if (!currentChat) return;

    try {
      await axios.put(
        `${server}/conversation/update-last-message/${currentChat._id}`,
        {
          lastMessage: message,
          lastMessageId: seller._id,
        },
        { withCredentials: true }
      );

      setConversations(prev =>
        prev
          .map(conv =>
            conv._id === currentChat._id
              ? {
                  ...conv,
                  lastMessage: message,
                  lastMessageId: seller._id,
                  updatedAt: new Date().toISOString(),
                }
              : conv
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      );
    } catch (err) {
      console.error('Failed to update last message:', err);
    }
  };

  const isOnline = (userId) => {
    return onlineUsers.some(user => user.userId === userId);
  };

  if (loading && !currentChat) {
    return <div className={styles.section}>Loading conversations...</div>;
  }

  if (error) {
    return <div className={styles.section}>Error: {error}</div>;
  }

  return (
    <div className={`${styles.section} bg-[#f5f5f5] py-10`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-[#5a4336] hover:text-[#a67d6d]"
          >
            <AiOutlineArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-[#5a4336]">Messages</h1>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(100vh-180px)]">
          {/* Conversation List */}
          <div
            className={`${currentChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r`}
          >
            <div className="overflow-y-auto h-full">
              {conversations.map((conversation) => {
                const userId = conversation.members.find(
                  (member) => member !== seller._id
                );
                return (
                  <div
                    key={conversation._id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      currentChat?._id === conversation._id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => {
                      setCurrentChat(conversation);
                      const userId = conversation.members.find(member => member !== seller._id);
                      axios.get(`${server}/user/user-info/${userId}`)
                        .then(res => setUserData(res.data.user))
                        .catch(err => console.error(err));
                      setActiveStatus(isOnline(userId));
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={`${backend_url}${
                            conversation.userAvatar || '/default-avatar.png'
                          }`}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            isOnline(userId) ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-[#5a4336] truncate">
                          {conversation.userName || 'User'}
                        </h3>
                        <p className="text-sm text-[#5a4336] truncate">
                          {conversation.lastMessageId === seller._id
                            ? `You: ${conversation.lastMessage}`
                            : conversation.lastMessage}
                        </p>
                      </div>
                      <div className="text-xs text-[#5a4336]">
                        {moment(conversation.updatedAt).fromNow()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          {currentChat ? (
            <div className="w-full md:w-2/3 flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => setCurrentChat(null)}
                    className="md:hidden mr-3 text-[#5a4336]"
                  >
                    <AiOutlineArrowLeft size={20} />
                  </button>
                  <div className="flex items-center gap-3">
                    <img
                      src={`${backend_url}${
                        userData?.avatar || '/default-avatar.png'
                      }`}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="font-medium text-[#5a4336]">
                        {userData?.name || 'User'}
                      </h2>
                      <p className="text-xs text-[#5a4336]">
                        {activeStatus ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowTranslated(!showTranslated)}
                  className="p-2 bg-[#a67d6d] text-white rounded-md flex items-center gap-1"
                >
                  <AiOutlineTranslation />
                  {showTranslated ? 'Show Original' : 'Show Translated'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}>
                {loading ? (
                  <div>Loading messages...</div>
                ) : messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex mb-4 ${
                        message.sender === seller._id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                      ref={index === messages.length - 1 ? scrollRef : null}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                          message.sender === seller._id
                            ? 'bg-[#a67d6d] text-white'
                            : 'bg-[#d8c4b8] text-[#5a4336]'
                        }`}
                      >
                        {message.images && (
                          <img
                            src={`${backend_url}${message.images}`}
                            alt="Attachment"
                            className="max-w-full rounded mb-1"
                          />
                        )}
                        {message.text && (
                          <p>{showTranslated && message.translatedText ? message.translatedText : message.text}</p>
                        )}
                        <p className="text-xs opacity-80 mt-1">
                          {moment(message.createdAt).fromNow()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[#5a4336]">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-white">
                <form
                  onSubmit={sendMessageHandler}
                  className="flex items-center gap-2"
                >
                  <label className="cursor-pointer text-[#5a4336] hover:text-[#8b6b61]">
                    <TfiGallery size={20} />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 border border-[#d8c4b8] rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#c8a4a5] text-[#5a4336]"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-[#c8a4a5] text-white p-2 rounded-full hover:bg-[#b59292] disabled:opacity-50"
                  >
                    <AiOutlineSend size={20} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex md:w-2/3 items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <div className="text-[#a67d6d] mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#5a4336] mb-1">
                  Select a conversation
                </h3>
                <p className="text-[#8b6b61]">
                  Choose from your existing messages
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardMessages;