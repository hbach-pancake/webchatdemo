import { auth, db } from "@/config/firebase";
import { IMessage } from "@/types";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import React, { useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

const StyleMessage = styled.p`
  width: fit-content;
  word-break: break-all;
  max-width: 90%;
  min-width: 30%;
  padding: 15px 15px 30px;
  border-radius: 8px;
  margin: 10px;
  position: relative;
`;
const StyledSend = styled(StyleMessage)`
  margin-left: auto;
  background-color: #dcf8c6;
  height: 100%;
`;

const StyledReceive = styled(StyleMessage)`
  background-color: whitesmoke;
`;

const StyledTimestamp = styled.span`
  color: gray;
  padding: 10px;
  font-size: small;
  position: absolute;
  bottom: 0;
  right: 0;
  text-align: center;
`;

const StyledMessageImg = styled.img`
  width: 100%;
  height: auto;
`;

const DeleteButton = styled(DeleteForeverIcon)`
  position: absolute;
  top: 50%;
  right: -20px;
  transform: translateY(-50%);
  cursor: pointer;
`;

const Message = ({ message }: { message: IMessage }) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  const [isHovered, setIsHovered] = useState(false);
  const isSentMessage = loggedInUser?.email === message.user;

  const MessageType = isSentMessage ? StyledSend : StyledReceive;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const deleteMessage = async () => {
    try {
      // Lấy tất cả các tài liệu trong collection "messages"
      const querySnapshot = await getDocs(collection(db, "messages"));
      querySnapshot.forEach((docSnapshot) => {
        const documentId = docSnapshot.id;
        if (documentId == message.id) {
          const documentRef = doc(db, "messages", documentId);
          deleteDoc(documentRef);
        }
      });
    } catch (error) {
      console.error("Lỗi khi lấy tài liệu:", error);
    }
  };

  return (
    <MessageType
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && isSentMessage && <DeleteButton onClick={deleteMessage} />}
      {message.text &&
      (message.text.includes(".jpg") ||
        message.text.includes(".heic") ||
        message.text.includes(".png") ||
        message.text.includes(".jpeg") ||
        message.text.includes(".svg") ||
        message.text.includes(".gif")) ? (
        <StyledMessageImg src={message.text} alt="Message Image" />
      ) : message.text &&
        (message.text.includes(".mov") ||
          message.text.includes(".mp4") ||
          message.text.includes(".avi")) ? (
        <video
          src={message.text}
          controls
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        ></video>
      ) : (
        message.text
      )}
      <StyledTimestamp>{message.sent_at}</StyledTimestamp>
    </MessageType>
  );
};

export default Message;
