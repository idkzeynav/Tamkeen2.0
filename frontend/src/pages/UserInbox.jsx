// import React, { useEffect, useRef, useState } from "react";
// import Header from "../components/Layout/Header";
// import { useSelector } from "react-redux";
// import io from "socket.io-client";
// import { backend_url, server } from "../server";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { AiOutlineArrowsAlt, AiOutlineSend } from "react-icons/ai";
// import { TfiGallery } from "react-icons/tfi";
// import { MdTranslate, MdOutlineKeyboardArrowDown } from "react-icons/md";
// import styles from "../styles/styles";
// import moment from "moment";
// import ProfileSidebar from "../components/Profile/ProfileSidebar";

// const ENDPOINT = "http://localhost:4000";
// let socket;

// const UserInbox = () => {
//   const { user } = useSelector((state) => state.user);
//   const [conversations, setConversations] = useState([]);
//   const [arrivalMessage, setArrivalMessage] = useState(null);
//   const [currentChat, setCurrentChat] = useState();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const [userData, setUserData] = useState(null);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [images, setImages] = useState();
//   const [activeStatus, setActiveStatus] = useState(false);
//   const [open, setOpen] = useState(false);
//   const scrollRef = useRef(null);
//   const [minimizedChats, setMinimizedChats] = useState([]);

//   const handleKeyDown = (event) => {
//     if (event.key === 'Escape') {
//       setOpen(false); // Close the chat when Esc is pressed
//     }
//   };

  

//   useEffect(() => {
//     socket = io(ENDPOINT);
    
//     socket.on("connect", () => {
//       console.log("Connected to server");
//     });

//     socket.on("connect_error", (error) => {
//       console.log("Connection error:", error);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     if (socket) {
//       socket.on("getMessage", (data) => {
//         setArrivalMessage({
//           sender: data.senderId,
//           text: data.text,
//           createdAt: Date.now(),
//         });
//       });
//     }
//   }, [socket]);

//   useEffect(() => {
//     arrivalMessage &&
//       currentChat?.members.includes(arrivalMessage.sender) &&
//       setMessages((prev) => [...prev, arrivalMessage]);
//   }, [arrivalMessage, currentChat]);

//   useEffect(() => {
//     const getConversations = async () => {
//       try {
//         const response = await axios.get(
//           `${server}/conversation/get-all-conversation-user/${user?._id}`,
//           {
//             withCredentials: true,
//           }
//         );
  
//         // Group conversations by seller ID
//         const groupedConversations = response.data.conversations.reduce((acc, conv) => {
//           // Find the seller ID (the member that isn't the current user)
//           const sellerId = conv.members.find(memberId => memberId !== user?._id);
          
//           if (!acc[sellerId]) {
//             // If this is the first conversation with this seller, add it
//             acc[sellerId] = conv;
//           } else {
//             // If we already have a conversation with this seller,
//             // keep the most recent one based on updatedAt
//             if (new Date(conv.updatedAt) > new Date(acc[sellerId].updatedAt)) {
//               acc[sellerId] = conv;
//             }
//           }
//           return acc;
//         }, {});
  
//         // Convert the grouped conversations object back to an array
//         const uniqueConversations = Object.values(groupedConversations);
  
//         // Sort conversations by most recent first
//         const sortedConversations = uniqueConversations.sort((a, b) => 
//           new Date(b.updatedAt) - new Date(a.updatedAt)
//         );
  
//         setConversations(sortedConversations);
  
//         // Handle URL parameter for direct conversation opening
//         const conversationId = window.location.search.slice(1);
//         if (conversationId) {
//           const currentConversation = sortedConversations.find(
//             (conv) => conv._id === conversationId
//           );
//           if (currentConversation) {
//             setCurrentChat(currentConversation);
//             setOpen(true);
            
//             // Get user data for the conversation
//             const userId = currentConversation.members.find(
//               (member) => member !== user?._id
//             );
//             const userData = await axios.get(
//               `${server}/shop/get-shop-info/${userId}`
//             );
//             setUserData(userData.data.shop);
//           }
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     getConversations();
//   }, [user]);

//   useEffect(() => {
//     if (user) {
//       const userId = user?._id;
//       socket.emit("addUser", userId);
//       socket.on("getUsers", (data) => {
//         setOnlineUsers(data);
//       });
//     }
//   }, [user]);

//   const onlineCheck = (chat) => {
//     const chatMembers = chat.members.find((member) => member !== user?._id);
//     const online = onlineUsers.find((onlineUser) => onlineUser.userId === chatMembers);
//     return online ? true : false;
//   };
  

//   useEffect(() => {
//     const getMessage = async () => {
//       if (currentChat) {
//         try {
//           const response = await axios.get(
//             `${server}/message/get-all-messages/${currentChat?._id}`
//           );
//           setMessages(response.data.messages);
//         } catch (error) {
//           console.log(error);
//         }
//       }
//     };
//     getMessage();
//   }, [currentChat]);

//   const sendMessageHandler = async (e) => {
//     e.preventDefault();

//     const message = {
//       sender: user._id,
//       text: newMessage,
//       conversationId: currentChat._id,
//     };
//     const receiverId = currentChat.members.find(
//       (member) => member !== user?._id
//     );

//     socket.emit("sendMessage", {
//       senderId: user?._id,
//       receiverId,
//       text: newMessage,
//     });

//     try {
//       if (newMessage !== "") {
//         const res = await axios.post(`${server}/message/create-new-message`, message);
//         setMessages([...messages, res.data.message]);
//         updateLastMessage();
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const updateLastMessage = async () => {
//     socket.emit("updateLastMessage", {
//       lastMessage: newMessage,
//       lastMessageId: user._id,
//     });

//     await axios
//       .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
//         lastMessage: newMessage,
//         lastMessageId: user._id,
//       })
//       .then((res) => {
//         setNewMessage("");
//         setConversations(prevConversations => 
//           prevConversations.map(conv => 
//             conv._id === currentChat._id 
//               ? {...conv, lastMessage: newMessage, lastMessageId: user._id, updatedAt: new Date().toISOString()}
//               : conv
//           ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
//         );
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     setImages(file);
//     imageSendingHandler(file);
//   };

//   const imageSendingHandler = async (e) => {
//     const formData = new FormData();

//     formData.append("images", e);
//     formData.append("sender", user._id);
//     formData.append("text", newMessage);
//     formData.append("conversationId", currentChat._id);

//     const receiverId = currentChat.members.find(
//       (member) => member !== user._id
//     );

//     socket.emit("sendMessage", {
//       senderId: user._id,
//       receiverId,
//       images: e,
//     });

//     try {
//       await axios
//         .post(`${server}/message/create-new-message`, formData, {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         })
//         .then((res) => {
//           setImages();
//           setMessages([...messages, res.data.message]);
//           updateLastMessageForImage();
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const updateLastMessageForImage = async () => {
//     await axios.put(
//       `${server}/conversation/update-last-message/${currentChat._id}`,
//       {
//         lastMessage: "Photo",
//         lastMessageId: user._id,
//       }
//     );
//   };

//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   useEffect(() => {
//     window.addEventListener("keydown", handleKeyDown);

//     return () => {
//       window.removeEventListener("keydown", handleKeyDown);
//     };
//   }, []);
//   return (
//     <div className="flex flex-col h-screen bg-gray-100">
//       <Header /> {/* Add the header here */}
//       <div className="flex flex-grow overflow-hidden"> {/* Ensure flex grow and prevent overflow */}
//         <div className="w-1/3 bg-white shadow-lg border-r"> {/* Inbox Area */}
//           <div className="p-4 border-b">
//             <h1 className="text-2xl font-semibold text-[#5a4336]">Messages</h1>
//           </div>
//           <div className="overflow-y-hidden flex-grow"> {/* Prevent scrolling */}
//             {conversations &&
//               conversations.map((item, index) => (
//                 <MessageList
//                   data={item}
//                   key={index}
//                   index={index}
//                   setOpen={setOpen}
//                   setCurrentChat={setCurrentChat}
//                   me={user?._id}
//                   setUserData={setUserData}
//                   online={onlineCheck(item)}
//                   setActiveStatus={setActiveStatus}
      
//                 />
//               ))}
//           </div>
//         </div>
  
//         {/* Conditional rendering for chat and no chat state */}
//         {open ? (
//           <div className="flex-grow w-full md:w-2/3 bg-gray-50">
//             <SellerInbox
//               setOpen={setOpen}
//               newMessage={newMessage}
//               setNewMessage={setNewMessage}
//               sendMessageHandler={sendMessageHandler}
//               messages={messages}
//               sellerId={user._id}
//               userData={userData}
//               activeStatus={activeStatus}
//               scrollRef={scrollRef}
//               handleImageUpload={handleImageUpload} 
//             />
//           </div>
//         ) : (
//           <div className="flex justify-center items-center flex-grow">
//             <img
//               src="/images/chatt.png" // Replace with your image path
//               alt="No chat open"
//               className="max-w-md w-full h-auto object-cover"
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };  
 

// const MessageList = ({
//   data,
//   index,
//   setOpen,
//   setCurrentChat,
//   me,
//   setUserData,
//   online,
//   setActiveStatus,
// }) => {
//   const [user, setUser] = useState([]);
//   const navigate = useNavigate();
//   const handleClick = (id) => {
//     navigate(`/inbox?${id}`);
//     setOpen(true);
//   };

//   useEffect(() => {
//     setActiveStatus(online);
//     const userId = data.members.find((user) => user !== me);
//     const getUser = async () => {
//       try {
//         const res = await axios.get(`${server}/shop/get-shop-info/${userId}`);
//         setUser(res.data.shop);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     getUser();
//   }, [me, data]);

//   return (
//     <div
//       className="p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md"
//       onClick={() => {
//         setOpen(true);
//         setCurrentChat(data);
//         setUserData(user);
//         setActiveStatus(online);
//         navigate(`/inbox?${data._id}`);
//       }}
//     >
      
//       <div className="flex items-center space-x-4">
//         <div className="relative">
//           <img
//             src={`${backend_url}${user?.avatar}`}
//             alt=""
//             className="w-12 h-12 rounded-full object-cover"
//           />
//           <div
//             className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
//               online ? "bg-green-400" : "bg-gray-400"
//             }`}
//           />
//         </div>
//         <div className="flex-grow">
//           <h2 className="text-lg font-semibold text-[#5a43360]">{user?.name}</h2>
//           <p className="text-sm text-[#5a43360] truncate">
//             {data?.lastMessageId !== me
//               ? `${user?.name?.split(" ")[0]}: `
//               : "You: "}
//             {data?.lastMessage}
//           </p>
//         </div>
        
// <span className="text-xs text-[#5a43360]">
//   {moment(data.updatedAt).fromNow()}
// </span>
//       </div>
//     </div>
//   );
// };

// const SellerInbox = ({
//   setOpen,
//   newMessage,
//   setNewMessage,
//   sendMessageHandler,
//   messages,
//   sellerId,
//   userData,
//   activeStatus,
//   scrollRef,
//   handleImageUpload,
// }) => {
//   const [showTranslated, setShowTranslated] = useState(true);
//   const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
//   return (
//     <div className="flex flex-col h-full">
//       {/* Header with user info and translation toggle */}
//       <div className="bg-white shadow-md z-10 p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center">
//             <button
//               onClick={() => setOpen(false)}
//               className="md:hidden mr-4 text-gray-600 hover:text-gray-800 transition-colors duration-150 ease-in-out"
//             >
//               <AiOutlineArrowsAlt size={24} />
//             </button>
//             <img
//               src={`${backend_url}${userData?.avatar}`}
//               alt=""
//               className="w-10 h-10 rounded-full object-cover"
//             />
//             <div className="ml-4">
//               <h2 className="text-lg font-semibold text-gray-800">{userData?.name}</h2>
//               <p className="text-sm text-gray-600">
//                 {activeStatus ? "Active Now" : "Offline"}
//               </p>
//             </div>
//           </div>
          
//           <div className="relative">
//             <button 
//               className={`flex items-center px-4 py-2 rounded-full text-sm transition-all duration-300 ${
//                 showTranslated 
//                   ? "bg-[#a67d6d] text-white" 
//                   : "bg-gray-200 text-gray-700"
//               }`}
//               onClick={() => setShowLanguageMenu(!showLanguageMenu)}
//             >
//               <MdTranslate className="mr-2" size={18} />
//               {showTranslated ? "Translate to Urdu" : "Show Original"}
//               <MdOutlineKeyboardArrowDown className="ml-1" size={16} />
//             </button>
            
//             {showLanguageMenu && (
//               <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
//                 <div className="py-1">
//                   <button 
//                     className={`flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${showTranslated ? 'font-medium text-[#a67d6d]' : ''}`} 
//                     onClick={() => {
//                       setShowTranslated(true);
//                       setShowLanguageMenu(false);
//                     }}
//                   >
//                     <span className="ml-2">Show in Urdu</span>
//                     {showTranslated && <span className="ml-auto">✓</span>}
//                   </button>
//                   <button 
//                     className={`flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100 ${!showTranslated ? 'font-medium text-[#a67d6d]' : ''}`}
//                     onClick={() => {
//                       setShowTranslated(false);
//                       setShowLanguageMenu(false);
//                     }}
//                   >
//                     <span className="ml-2">Show Original</span>
//                     {!showTranslated && <span className="ml-auto">✓</span>}
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Chat messages area */}
//       <div 
//         className="flex-grow overflow-y-auto p-4" 
//         style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}
//         onClick={() => showLanguageMenu && setShowLanguageMenu(false)}
//       >
//         {messages &&
//           messages.map((item, index) => (
//             <div
//               key={index}
//               className={`flex mb-4 ${
//                 item.sender === sellerId ? "justify-end" : "justify-start"
//               }`}
//               ref={scrollRef}
//             >
//               <div className={`max-w-[70%] ${item.sender === sellerId ? "items-end" : "items-start"}`}>
//                 {item.images && (
//                   <img
//                     src={`${backend_url}${item.images}`}
//                     className="max-w-full rounded-lg shadow-md mb-1"
//                     alt="Shared image"
//                   />
//                 )}
//                 {item.text !== "" && (
//                   <div
//                     className={`rounded-2xl px-4 py-2 shadow-md ${
//                       item.sender === sellerId
//                       ? "bg-[#a67d6d] text-white"  // Sender message bubble color
//                       : "bg-[#d8c4b8] text-gray-800" // Incoming message bubble color
//                     }`}
//                   >
//                     <p>{showTranslated ? item.translatedText : item.text}</p>
                    
//                     {/* Small indicator when a message is translated */}
//                     {showTranslated && item.translatedText && item.translatedText !== item.text && (
//                       <div className="flex items-center justify-end mt-1 opacity-70">
//                         <MdTranslate size={12} className="mr-1" />
//                         <span className="text-xs" style={{ fontFamily: "Noto Nastaliq Urdu, Arial, sans-serif" }}>اردو</span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//                 <p className="text-xs text-gray-500 mt-1">
//                   {moment(item.createdAt).fromNow()}
//                 </p>
//               </div>
//             </div>
//           ))}
//       </div>

//       {/* Message input area */}
//       <div className="bg-white border-t border-gray-200 p-4">
//         <form
//           className="flex items-center"
//           onSubmit={sendMessageHandler}
//         >
//           <label htmlFor="image" className="mr-3 text-gray-500 hover:text-gray-700 cursor-pointer">
//             <TfiGallery size={24} />
//           </label>
//           <input
//             type="file"
//             id="image"
//             className="hidden"
//             onChange={handleImageUpload}
//           />
//           <input
//             type="text"
//             required
//             placeholder="Type your message..."
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             className="flex-grow bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#c8a4a5]"
//           />
//           <button
//             type="submit"
//             className="ml-3 bg-[#c8a4a5] text-white rounded-full p-2 hover:bg-[#c8a4a5] transition-colors duration-150 ease-in-out"
//           >
//             <AiOutlineSend size={24} />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default UserInbox;
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import io from 'socket.io-client';
import { backend_url, server } from '../server';
import axios from 'axios';
import { AiOutlineSend, AiOutlineArrowLeft, AiOutlineTranslation } from 'react-icons/ai';
import { TfiGallery } from 'react-icons/tfi';
import moment from 'moment';
import styles from '../styles/styles';

const ENDPOINT = "http://localhost:4000";
let socket;

const UserInbox = () => {
  const { user } = useSelector((state) => state.user);
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showTranslated, setShowTranslated] = useState(true);
  const scrollRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    socket = io(ENDPOINT, {
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

    socket.on('getMessage', (data) => {
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

  // Handle incoming messages
  useEffect(() => {
    if (arrivalMessage && currentChat?.members.includes(arrivalMessage.sender)) {
      setMessages((prev) => [...prev, arrivalMessage]);
      updateLastMessage(arrivalMessage.text || 'Photo');
    }
  }, [arrivalMessage, currentChat]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${server}/conversation/get-all-conversation-user/${user?._id}`,
          { withCredentials: true }
        );

        const conversationsWithData = await Promise.all(
          res.data.conversations.map(async (conv) => {
            const sellerId = conv.members.find(id => id !== user._id);
            try {
              const shopRes = await axios.get(
                `${server}/shop/get-shop-info/${sellerId}`
              );
              return {
                ...conv,
                shopName: shopRes.data.shop?.name,
                shopAvatar: shopRes.data.shop?.avatar,
              };
            } catch (err) {
              return conv;
            }
          })
        );

        setConversations(conversationsWithData);
      } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchConversations();
    }
  }, [user]);

  // Fetch messages when chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChat?._id) {
        try {
          setLoading(true);
          const res = await axios.get(
            `${server}/message/get-all-messages/${currentChat._id}`
          );
          setMessages(res.data.messages);
        } catch (err) {
          setError('Failed to load messages');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMessages();
  }, [currentChat]);

  // Set up online users
  useEffect(() => {
    if (user?._id) {
      socket.emit('addUser', user._id);
      socket.on('getUsers', (users) => {
        setOnlineUsers(users);
      });
    }

    return () => {
      socket.off('getUsers');
    };
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageHandler = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat) return;

    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(member => member !== user._id);

    try {
      // Emit socket event
      socket.emit('sendMessage', {
        senderId: user._id,
        receiverId,
        text: newMessage,
      });

      // Save to database
      const res = await axios.post(
        `${server}/message/create-new-message`,
        message,
        { withCredentials: true }
      );

      // Update local state
      setMessages([...messages, res.data.message]);
      updateLastMessage(newMessage);
      setNewMessage('');
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
    formData.append('sender', user._id);
    formData.append('conversationId', currentChat._id);

    const receiverId = currentChat.members.find(member => member !== user._id);

    try {
      // Save image to database
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

      // Emit socket event
      socket.emit('sendMessage', {
        senderId: user._id,
        receiverId,
        images: res.data.message.images,
      });

      // Update local state
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
          lastMessageId: user._id,
        },
        { withCredentials: true }
      );

      // Update local conversations state
      setConversations(prev =>
        prev
          .map(conv =>
            conv._id === currentChat._id
              ? {
                  ...conv,
                  lastMessage: message,
                  lastMessageId: user._id,
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
        <div className="p-4 border-b">
          <h1 className="text-2xl font-semibold text-[#5a4336]">Messages</h1>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(100vh-180px)]">
          {/* Conversation List */}
          <div
            className={`${currentChat ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r`}
          >
            <div className="overflow-y-auto h-full">
              {conversations.map((conversation) => {
                const sellerId = conversation.members.find(
                  (member) => member !== user._id
                );
                return (
                  <div
                    key={conversation._id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      currentChat?._id === conversation._id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setCurrentChat(conversation)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={`${backend_url}${
                            conversation.shopAvatar || '/default-avatar.png'
                          }`}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            isOnline(sellerId) ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-[#5a4336] truncate">
                          {conversation.shopName || 'Seller'}
                        </h3>
                        <p className="text-sm text-[#5a4336] truncate">
                          {conversation.lastMessageId === user._id
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
                        currentChat.shopAvatar || '/default-avatar.png'
                      }`}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="font-medium text-[#5a4336]">
                        {currentChat.shopName || 'Seller'}
                      </h2>
                      <p className="text-xs text-[#5a4336]">
                        {isOnline(
                          currentChat.members.find(
                            (member) => member !== user._id
                          )
                        )
                          ? 'Online'
                          : 'Offline'}
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
                        message.sender === user._id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                      ref={index === messages.length - 1 ? scrollRef : null}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                          message.sender === user._id
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

export default UserInbox;