import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Layout/Header";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { backend_url, server } from "../server";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowsAlt, AiOutlineSend } from "react-icons/ai";
import { TfiGallery } from "react-icons/tfi";
import { MdTranslate, MdOutlineKeyboardArrowDown } from "react-icons/md";
import styles from "../styles/styles";
import moment from "moment";
import ProfileSidebar from "../components/Profile/ProfileSidebar";

const ENDPOINT = "http://localhost:4000";
let socket;

const UserInbox = () => {
  const { user } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [images, setImages] = useState();
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);
  const [minimizedChats, setMinimizedChats] = useState([]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false); // Close the chat when Esc is pressed
    }
  };

  

  useEffect(() => {
    socket = io(ENDPOINT);
    
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("connect_error", (error) => {
      console.log("Connection error:", error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("getMessage", (data) => {
        setArrivalMessage({
          sender: data.senderId,
          text: data.text,
          createdAt: Date.now(),
        });
      });
    }
  }, [socket]);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-user/${user?._id}`,
          {
            withCredentials: true,
          }
        );
  
        // Group conversations by seller ID
        const groupedConversations = response.data.conversations.reduce((acc, conv) => {
          // Find the seller ID (the member that isn't the current user)
          const sellerId = conv.members.find(memberId => memberId !== user?._id);
          
          if (!acc[sellerId]) {
            // If this is the first conversation with this seller, add it
            acc[sellerId] = conv;
          } else {
            // If we already have a conversation with this seller,
            // keep the most recent one based on updatedAt
            if (new Date(conv.updatedAt) > new Date(acc[sellerId].updatedAt)) {
              acc[sellerId] = conv;
            }
          }
          return acc;
        }, {});
  
        // Convert the grouped conversations object back to an array
        const uniqueConversations = Object.values(groupedConversations);
  
        // Sort conversations by most recent first
        const sortedConversations = uniqueConversations.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
  
        setConversations(sortedConversations);
  
        // Handle URL parameter for direct conversation opening
        const conversationId = window.location.search.slice(1);
        if (conversationId) {
          const currentConversation = sortedConversations.find(
            (conv) => conv._id === conversationId
          );
          if (currentConversation) {
            setCurrentChat(currentConversation);
            setOpen(true);
            
            // Get user data for the conversation
            const userId = currentConversation.members.find(
              (member) => member !== user?._id
            );
            const userData = await axios.get(
              `${server}/shop/get-shop-info/${userId}`
            );
            setUserData(userData.data.shop);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    getConversations();
  }, [user]);

  useEffect(() => {
    if (user) {
      const userId = user?._id;
      socket.emit("addUser", userId);
      socket.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [user]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== user?._id);
    const online = onlineUsers.find((onlineUser) => onlineUser.userId === chatMembers);
    return online ? true : false;
  };
  

  useEffect(() => {
    const getMessage = async () => {
      if (currentChat) {
        try {
          const response = await axios.get(
            `${server}/message/get-all-messages/${currentChat?._id}`
          );
          setMessages(response.data.messages);
        } catch (error) {
          console.log(error);
        }
      }
    };
    getMessage();
  }, [currentChat]);

  const sendMessageHandler = async (e) => {
    e.preventDefault();

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      (member) => member !== user?._id
    );

    socket.emit("sendMessage", {
      senderId: user?._id,
      receiverId,
      text: newMessage,
    });

    try {
      if (newMessage !== "") {
        const res = await axios.post(`${server}/message/create-new-message`, message);
        setMessages([...messages, res.data.message]);
        updateLastMessage();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessage = async () => {
    socket.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: user._id,
    });

    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: user._id,
      })
      .then((res) => {
        setNewMessage("");
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv._id === currentChat._id 
              ? {...conv, lastMessage: newMessage, lastMessageId: user._id, updatedAt: new Date().toISOString()}
              : conv
          ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImages(file);
    imageSendingHandler(file);
  };

  const imageSendingHandler = async (e) => {
    const formData = new FormData();

    formData.append("images", e);
    formData.append("sender", user._id);
    formData.append("text", newMessage);
    formData.append("conversationId", currentChat._id);

    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );

    socket.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      images: e,
    });

    try {
      await axios
        .post(`${server}/message/create-new-message`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setImages();
          setMessages([...messages, res.data.message]);
          updateLastMessageForImage();
        });
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastMessageForImage = async () => {
    await axios.put(
      `${server}/conversation/update-last-message/${currentChat._id}`,
      {
        lastMessage: "Photo",
        lastMessageId: user._id,
      }
    );
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header /> {/* Add the header here */}
      <div className="flex flex-grow overflow-hidden"> {/* Ensure flex grow and prevent overflow */}
        <div className="w-1/3 bg-white shadow-lg border-r"> {/* Inbox Area */}
          <div className="p-4 border-b">
            <h1 className="text-2xl font-semibold text-[#5a4336]">Messages</h1>
          </div>
          <div className="overflow-y-hidden flex-grow"> {/* Prevent scrolling */}
            {conversations &&
              conversations.map((item, index) => (
                <MessageList
                  data={item}
                  key={index}
                  index={index}
                  setOpen={setOpen}
                  setCurrentChat={setCurrentChat}
                  me={user?._id}
                  setUserData={setUserData}
                  online={onlineCheck(item)}
                  setActiveStatus={setActiveStatus}
      
                />
              ))}
          </div>
        </div>
  
        {/* Conditional rendering for chat and no chat state */}
        {open ? (
          <div className="flex-grow w-full md:w-2/3 bg-gray-50">
            <SellerInbox
              setOpen={setOpen}
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              sendMessageHandler={sendMessageHandler}
              messages={messages}
              sellerId={user._id}
              userData={userData}
              activeStatus={activeStatus}
              scrollRef={scrollRef}
              handleImageUpload={handleImageUpload} 
            />
          </div>
        ) : (
          <div className="flex justify-center items-center flex-grow">
            <img
              src="/images/chatt.png" // Replace with your image path
              alt="No chat open"
              className="max-w-md w-full h-auto object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};  
 

const MessageList = ({
  data,
  index,
  setOpen,
  setCurrentChat,
  me,
  setUserData,
  online,
  setActiveStatus,
}) => {
  const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const handleClick = (id) => {
    navigate(`/inbox?${id}`);
    setOpen(true);
  };

  useEffect(() => {
    setActiveStatus(online);
    const userId = data.members.find((user) => user !== me);
    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/shop/get-shop-info/${userId}`);
        setUser(res.data.shop);
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, [me, data]);

  return (
    <div
      className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md"
      onClick={() => {
        setOpen(true);
        setCurrentChat(data);
        setUserData(user);
        setActiveStatus(online);
        navigate(`/inbox?${data._id}`);
      }}
    >
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={`${backend_url}${user?.avatar}`}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
          <div
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
              online ? "bg-green-400" : "bg-gray-400"
            }`}
          />
        </div>
        <div className="flex-grow">
          <h2 className="text-lg font-semibold text-[#5a43360]">{user?.name}</h2>
          <p className="text-sm text-[#5a43360] truncate">
            {data?.lastMessageId !== me
              ? `${user?.name?.split(" ")[0]}: `
              : "You: "}
            {data?.lastMessage}
          </p>
        </div>
        
<span className="text-xs text-[#5a43360]">
  {moment(data.updatedAt).fromNow()}
</span>
      </div>
    </div>
  );
};

const SellerInbox = ({
  setOpen,
  newMessage,
  setNewMessage,
  sendMessageHandler,
  messages,
  sellerId,
  userData,
  activeStatus,
  scrollRef,
  handleImageUpload,
}) => {
  const [showTranslated, setShowTranslated] = useState(true);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with user info and translation toggle */}
      <div className="bg-white shadow-md z-10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setOpen(false)}
              className="md:hidden mr-4 text-gray-600 hover:text-gray-800 transition-colors duration-150 ease-in-out"
            >
              <AiOutlineArrowsAlt size={24} />
            </button>
            <img
              src={`${backend_url}${userData?.avatar}`}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-800">{userData?.name}</h2>
              <p className="text-sm text-gray-600">
                {activeStatus ? "Active Now" : "Offline"}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <button 
              className={`flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300 ${
                showTranslated 
                  ? "bg-[#a67d6d] text-white" 
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              <MdTranslate className="mr-2" size={18} />
              {showTranslated ? "Translate to Urdu" : "Show Original"}
              <MdOutlineKeyboardArrowDown className="ml-1" size={16} />
            </button>
            
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className={`flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${showTranslated ? 'font-medium text-[#a67d6d]' : ''}`} 
                    onClick={() => {
                      setShowTranslated(true);
                      setShowLanguageMenu(false);
                    }}
                  >
                    <span className="ml-2">Show in Urdu</span>
                    {showTranslated && <span className="ml-auto">✓</span>}
                  </button>
                  <button 
                    className={`flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${!showTranslated ? 'font-medium text-[#a67d6d]' : ''}`}
                    onClick={() => {
                      setShowTranslated(false);
                      setShowLanguageMenu(false);
                    }}
                  >
                    <span className="ml-2">Show Original</span>
                    {!showTranslated && <span className="ml-auto">✓</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat messages area */}
      <div 
        className="flex-grow overflow-y-auto p-4" 
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
        onClick={() => showLanguageMenu && setShowLanguageMenu(false)}
      >
        {messages &&
          messages.map((item, index) => (
            <div
              key={index}
              className={`flex mb-4 ${
                item.sender === sellerId ? "justify-end" : "justify-start"
              }`}
              ref={scrollRef}
            >
              <div className={`max-w-[70%] ${item.sender === sellerId ? "items-end" : "items-start"}`}>
                {item.images && (
                  <img
                    src={`${backend_url}${item.images}`}
                    className="max-w-full rounded-lg shadow-md mb-1"
                    alt="Shared image"
                  />
                )}
                {item.text !== "" && (
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-md ${
                      item.sender === sellerId
                      ? "bg-[#a67d6d] text-white"  // Sender message bubble color
                      : "bg-[#d8c4b8] text-gray-800" // Incoming message bubble color
                    }`}
                  >
                    <p>{showTranslated ? item.translatedText : item.text}</p>
                    
                    {/* Small indicator when a message is translated */}
                    {showTranslated && item.translatedText && item.translatedText !== item.text && (
                      <div className="flex items-center justify-end mt-1 opacity-70">
                        <MdTranslate size={12} className="mr-1" />
                        <span className="text-xs" style={{ fontFamily: "Noto Nastaliq Urdu, Arial, sans-serif" }}>اردو</span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {moment(item.createdAt).fromNow()}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* Message input area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form
          className="flex items-center"
          onSubmit={sendMessageHandler}
        >
          <label htmlFor="image" className="mr-3 text-gray-500 hover:text-gray-700 cursor-pointer">
            <TfiGallery size={24} />
          </label>
          <input
            type="file"
            id="image"
            className="hidden"
            onChange={handleImageUpload}
          />
          <input
            type="text"
            required
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
          />
          <button
            type="submit"
            className="ml-3 bg-[#c8a4a5] text-white rounded-full p-2 hover:bg-[#c8a4a5] transition-colors duration-150 ease-in-out"
          >
            <AiOutlineSend size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserInbox;