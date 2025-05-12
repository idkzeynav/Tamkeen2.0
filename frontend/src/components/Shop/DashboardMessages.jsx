// This is an updated version of DashboardMessages.jsx to match the layout and behavior of UserInbox.
// All logic remains unchanged as per the request.
// Changed components to reuse UserInbox structure and classes for consistent UI.

import axios from "axios";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { backend_url, server } from "../../server";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiOutlineArrowRight, AiOutlineSend,AiOutlineArrowLeft ,AiOutlineArrowsAlt} from "react-icons/ai";
import styles from "../../styles/styles";
import { TfiGallery } from "react-icons/tfi";
import socketIO from "socket.io-client";
import moment from "moment";

const ENDPOINT = "http://localhost:4000/";
const socketId = socketIO(ENDPOINT, { transports: ["websocket"] });

const DashboardMessages = () => {
  const { seller } = useSelector((state) => state.seller);
  const [conversations, setConversations] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [currentChat, setCurrentChat] = useState();
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [images, setImages] = useState();
  const [activeStatus, setActiveStatus] = useState(false);
  const [open, setOpen] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false); // Close the chat when Esc is pressed
    }
  };
  useEffect(() => {
    socketId.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    const getConversation = async () => {
      try {
        const response = await axios.get(
          `${server}/conversation/get-all-conversation-seller/${seller?._id}`,
          {
            withCredentials: true,
          }
        );
        const groupedConversations = response.data.conversations.reduce((acc, conv) => {
          const senderId = conv.members.find((memberId) => memberId !== seller?._id);
          if (!acc[senderId]) {
            acc[senderId] = { ...conv, messages: conv.messages || [] };
          } else {
            acc[senderId].messages = [...acc[senderId].messages, ...(conv.messages || [])];
            if (new Date(conv.updatedAt) > new Date(acc[senderId].updatedAt)) {
              acc[senderId] = { ...acc[senderId], ...conv };
            }
          }
          return acc;
        }, {});
        const sortedConversations = Object.values(groupedConversations).sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setConversations(sortedConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    getConversation();
  }, [seller, messages]);

  useEffect(() => {
    if (seller) {
      const userId = seller?._id;
      socketId.emit("addUser", userId);
      socketId.on("getUsers", (data) => {
        setOnlineUsers(data);
      });
    }
  }, [seller]);

  const onlineCheck = (chat) => {
    const chatMembers = chat.members.find((member) => member !== seller?._id);
    const online = onlineUsers.find((user) => user.userId === chatMembers);
    return online ? true : false;
  };

  // get messages
  useEffect(() => {
    const getMessage = async () => {
      try {
        const response = await axios.get(
          `${server}/message/get-all-messages/${currentChat?._id}`
        );
        setMessages(response.data.messages);
      } catch (error) {
        console.error(error);
      }
    };
    getMessage();
  }, [currentChat]);

  // create new message
  const sendMessageHandler = async (e) => {
    e.preventDefault();

    const message = {
      sender: seller._id,
      text: newMessage,
      conversationId: currentChat._id,
    };
    const receiverId = currentChat.members.find(
      (member) => member !== seller._id
    );

    socketId.emit("sendMessage", {
      senderId: seller._id,
      receiverId,
      text: newMessage,
    });

    try {
      if (newMessage !== "") {
        await axios
          .post(`${server}/message/create-new-message`, message)
          .then((res) => {
            setMessages([...messages, res.data.message]);
            updateLastMessage();
          })
          .catch((error) => {
            console.error(error);
          });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateLastMessage = async () => {
    socketId.emit("updateLastMessage", {
      lastMessage: newMessage,
      lastMessageId: seller._id,
    });

    await axios
      .put(`${server}/conversation/update-last-message/${currentChat._id}`, {
        lastMessage: newMessage,
        lastMessageId: seller._id,
      })
      .then((res) => {
        setNewMessage("");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // img upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImages(file);
    imageSendingHandler(file);
  };

  const imageSendingHandler = async (e) => {
    const formData = new FormData();

    formData.append("images", e);
    formData.append("sender", seller._id);
    formData.append("text", newMessage);
    formData.append("conversationId", currentChat._id);

    const receiverId = currentChat.members.find(
      (member) => member !== seller._id
    );

    socketId.emit("sendMessage", {
      senderId: seller._id,
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
      console.error(error);
    }
  };

  const updateLastMessageForImage = async () => {
    await axios.put(
      `${server}/conversation/update-last-message/${currentChat._id}`,
      {
        lastMessage: "Photo",
        lastMessageId: seller._id,
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
    <div className="flex  flex-col w-full h-screen bg-gray-100">
       <div className="flex flex-grow overflow-hidden"> {/* Ensure flex grow and prevent overflow */}
 {/* Back Button */}



        <div className="w-1/3 bg-white shadow-lg border-r"> {/* Inbox Area */}
        <div className="p-4 border-b flex items-center space-x-4">
    {/* Back Button */}
    <button
      onClick={() => navigate('/dashboard')}
      className="flex items-center space-x-2 text-[#5a4336] hover:text-[#a67d6d] transition-all duration-200"
    >
      <AiOutlineArrowLeft size={24} />
  
    </button>

    {/* Heading */}
    <h1 className="text-2xl font-semibold text-[#5a4336]">Messages</h1>
  </div>
  
          <div className="overflow-y-hidden flex-grow">
            {conversations &&
              conversations.map((item, index) => (
                <MessageList
                  data={item}
                  key={index}
                  index={index}
                  setOpen={setOpen}
                  setCurrentChat={setCurrentChat}
                  me={seller._id}
                  setUserData={setUserData}
                  userData={userData}
                  online={onlineCheck(item)}
                  setActiveStatus={setActiveStatus}
                />
      ))}
     </div>
   </div>
  {/* Right Panel: Messages */}
  
    {open ? (
      
      <div className="flex-grow w-full md:w-2/3 bg-gray-50">
      <UserInbox
        setOpen={setOpen}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        sendMessageHandler={sendMessageHandler}
        messages={messages}
        sellerId={seller._id}
        userData={userData}
        activeStatus={activeStatus}
        scrollRef={scrollRef}
        setMessages={setMessages}
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
}

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
    navigate(`/dashboard-messages?${id}`);
    setOpen(true);
  };
  const [active, setActive] = useState(0);

  useEffect(() => {
    const userId = data.members.find((user) => user !== me);

    const getUser = async () => {
      try {
        const res = await axios.get(`${server}/user/user-info/${userId}`);
        setUser(res.data.user);
      } catch (error) {
        console.error(error);
      }
    };
    getUser();
  }, [me, data]);

  return (
    <div
      className={`p-4 hover:bg-gray-50 cursor-pointer transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-md ${
        active === index ? "bg-[#00000010]" : "bg-transparent"
      }  cursor-pointer`}
          onClick={(e) =>
            setActive(index) ||
            handleClick(data._id) ||
            setCurrentChat(data) ||
            setUserData(user) ||
            setActiveStatus(online)
          }
        >
      <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={`${backend_url}${user?.avatar}`}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
            
            {online ? (
              <div className="w-[12px] h-[12px] bg-green-400 rounded-full absolute top-[2px] right-[2px]" />
            ) : null}
          </div>
          <div className="flex-grow">
            <h1 className="text-lg font-semibold text-[#5a43360]">{user?.name}</h1>
            <p className="text-sm text-[#5a43360] truncate">{data?.lastMessage}</p>
          </div>
          <div className="pl-3 absolute right-3 top-5">
            <AiOutlineArrowRight size={20} />
          </div>
     
      </div>

    </div>
    


  );
};

const UserInbox = ({
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
  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="bg-white shadow-md z-10 p-4 flex items-center">
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
      <button
          className="p-2 bg-[#a67d6d] text-white my-2"
          onClick={() => setShowTranslated(!showTranslated)}
        >
          {showTranslated ? "Original" : "Translated"}
        </button>

      {/* Messages Section */}
      <div className="flex-grow overflow-y-auto p-4" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}>
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
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {moment(item.createdAt).fromNow()}
                </p>
              </div>
            </div>
          ))}
      </div>

      {/* Message Input Section */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form className="flex items-center" onSubmit={sendMessageHandler}>
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

export default DashboardMessages;
