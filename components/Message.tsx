import { auth, db } from "@/config/firebase";
import { IMessage } from "@/types";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import Tooltip from "@mui/material/Tooltip";
import { useRouter } from "next/router";

const DeleteButton = styled(DeleteForeverIcon)`
  position: absolute;
  top: calc(50% - 12px);
  left: 0px;
  color: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  z-index: 2;
`;

const StyleMessage = styled.div`
  width: fit-content;
  word-break: break-all;
  max-width: 30%;
  margin: 5px;
  border-radius: 30px;
`;
const StyledSend = styled(StyleMessage)`
  margin-left: auto;
  position: relative;
  height: 100%;
  color: #fff;
  padding-left: 30px;
`;

const StyledReceive = styled(StyleMessage)`
  padding: 8px 12px;
  color: #000;
`;

const StyledMessageImg = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const StyledD = styled.div``;

const StyledDev = styled.div`
  padding: 8px 12px;
  background-color: #0084ff;
  border-radius: 18px;
`;

const StyledDevIt = styled.div`
  padding: 8px 12px;
  background-color: #e4e6eb;
  border-radius: 18px;
`;

const StyledTooltip = styled(Tooltip)`
  position: relative;
`;

const Message = ({ message }: { message: IMessage }) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  const isSentMessage = loggedInUser?.email === message.user;
  const [isHovered, setIsHovered] = useState(false);

  const MessageType = isSentMessage ? StyledSend : StyledReceive;
  // const MessageActive = isSentMessage ? StyledDev : StyledD;

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

      {isSentMessage ? (
        message.text &&
        (message.text.includes(".jpg") ||
          message.text.includes(".heic") ||
          message.text.includes(".png") ||
          message.text.includes(".jpeg") ||
          message.text.includes(".svg") ||
          message.text.includes(".gif")) ? (
          <StyledTooltip title={message.sent_at} placement="top">
            <StyledD>
              <StyledMessageImg src={message.text} alt="Message Image" />
            </StyledD>
          </StyledTooltip>
        ) : message.text &&
          (message.text.includes(".mov") ||
            message.text.includes(".mp4") ||
            message.text.includes(".avi")) ? (
          <StyledTooltip title={message.sent_at} placement="top">
            <StyledD>
              <video
                src={message.text}
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              ></video>
            </StyledD>
          </StyledTooltip>
        ) : message.text && message.text.includes(".mp3") ? (
          <StyledTooltip title={message.sent_at} placement="top">
            <StyledD>
              <audio
                src={message.text}
                controls
                style={{
                  display: "block",
                }}
              ></audio>
            </StyledD>
          </StyledTooltip>
        ) : (
          <StyledTooltip title={message.sent_at} placement="top">
            <StyledDev>{message.text}</StyledDev>
          </StyledTooltip>
        )
      ) : message.text &&
        (message.text.includes(".jpg") ||
          message.text.includes(".heic") ||
          message.text.includes(".png") ||
          message.text.includes(".jpeg") ||
          message.text.includes(".svg") ||
          message.text.includes(".gif")) ? (
        <StyledTooltip title={message.sent_at} placement="top">
          <StyledD>
            <StyledMessageImg src={message.text} alt="Message Image" />
          </StyledD>
        </StyledTooltip>
      ) : message.text &&
        (message.text.includes(".mov") ||
          message.text.includes(".mp4") ||
          message.text.includes(".avi")) ? (
        <StyledTooltip title={message.sent_at} placement="top">
          <StyledD>
            <video
              src={message.text}
              controls
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            ></video>
          </StyledD>
        </StyledTooltip>
      ) : message.text && message.text.includes(".mp3") ? (
        <StyledTooltip title={message.sent_at} placement="top">
          <StyledD>
            <audio
              src={message.text}
              controls
              style={{
                display: "block",
              }}
            ></audio>
          </StyledD>
        </StyledTooltip>
      ) : (
        <StyledTooltip title={message.sent_at} placement="top">
          <StyledDevIt>{message.text}</StyledDevIt>
        </StyledTooltip>
      )}
    </MessageType>
  );
};

export default Message;
