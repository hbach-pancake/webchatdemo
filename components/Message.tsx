import { auth, db } from "@/config/firebase";
import { IMessage } from "@/types";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import React, { useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import Tooltip from "@mui/material/Tooltip";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const DeleteButton = styled(MoreHorizIcon)`
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
  margin-bottom: 10px;
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
  border: 1px solid #d8d8d8;
  border-radius: 10px;
`;

const StyledD = styled.div`
  cursor: pointer;
`;

const StyledR = styled.div`
  cursor: pointer;
  display: flex;
  align-items: flex-end;
`;

const StyledR2 = styled(StyledR)`
  align-items: center;
`;

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

const StyledSum = styled.div`
  color: #000;
  top: calc(50% - 40px);
  left: -130px;
  position: absolute;
  padding: 10px;
  border: 1px solid #fff;
  box-shadow: 0 0 6px rgb(0 0 0 / 58%);
  border-radius: 10px;
  width: 130px;
  cursor: pointer;
  background-color: #fff;
  z-index: 2;
`;

const StyledAvt = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
`;

const Message = ({ message }: { message: IMessage }) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  const isSentMessage = loggedInUser?.email === message.user;
  const [isHovered, setIsHovered] = useState(false);
  const [otherUserPhotoURL, setOtherUserPhotoURL] = useState("");

  if (loggedInUser?.email !== message.user) {
    const fetchData = async () => {
      try {
        const documentSnapshot = await getDocs(collection(db, "users"));
        const promises = documentSnapshot.docs.map(async (docSnapshot) => {
          const documentId = docSnapshot.id;
          const documentRef = doc(db, "users", documentId);
          const documentSnapshotUsers = await getDoc(documentRef);
          if (documentSnapshotUsers.exists()) {
            const documentData = documentSnapshotUsers.data();
            const documentDataMail = documentData.email;
            if (documentDataMail === message.user) {
              return documentData.photoURL;
            }
          }
          return null;
        });
        const results = await Promise.all(promises);
        return results.find((photoURL) => photoURL !== null);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        return null;
      }
    };

    const fetchDataAndAssignValue = async () => {
      const url = await fetchData();
      setOtherUserPhotoURL(url);
    };

    fetchDataAndAssignValue();
  }

  const MessageType = isSentMessage ? StyledSend : StyledReceive;
  // const MessageActive = isSentMessage ? StyledDev : StyledD;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowPop(false);
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
  const [showPop, setShowPop] = useState(false);

  return (
    <MessageType
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && isSentMessage && (
        <Tooltip title="Tùy chọn" placement="bottom">
          <DeleteButton
            onClick={() => {
              setShowPop(!showPop);
            }}
          />
        </Tooltip>
      )}

      {showPop && <StyledSum onClick={deleteMessage}>Xóa, gỡ</StyledSum>}

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
              <StyledMessageImg
                src={message.text}
                alt="Message Image pls"
                onClick={() => window.open(message.text, "_blank")}
              />
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
                  height: "40px",
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
          <StyledR>
            <StyledAvt src={otherUserPhotoURL} />
            <StyledMessageImg
              src={message.text}
              alt="Message Image"
              onClick={() => window.open(message.text, "_blank")}
            />
          </StyledR>
        </StyledTooltip>
      ) : message.text &&
        (message.text.includes(".mov") ||
          message.text.includes(".mp4") ||
          message.text.includes(".avi")) ? (
        <StyledTooltip title={message.sent_at} placement="top">
          <StyledR>
            <StyledAvt src={otherUserPhotoURL} />
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
          </StyledR>
        </StyledTooltip>
      ) : message.text && message.text.includes(".mp3") ? (
        <StyledTooltip title={message.sent_at} placement="top">
          <StyledR2>
            <StyledAvt src={otherUserPhotoURL} />
            <audio
              src={message.text}
              controls
              style={{
                display: "block",
                height: "40px",
              }}
            ></audio>
          </StyledR2>
        </StyledTooltip>
      ) : (
        <StyledTooltip title={message.sent_at} placement="top">
          <StyledR2>
            <StyledAvt src={otherUserPhotoURL} />
            <StyledDevIt>{message.text}</StyledDevIt>
          </StyledR2>
        </StyledTooltip>
      )}
    </MessageType>
  );
};

export default Message;
