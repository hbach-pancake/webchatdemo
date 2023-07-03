import { IMessage } from "@/types";
import styled from "styled-components";
import React from "react";

const StyledImgAndVideo = styled.div`
  width: 49%;
  aspect-ratio: 1/1;
  padding: 5px;
  display: inline-block;
`;

const StyledMessageImg = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
`;

const MessagesMedia = ({ message }: { message: IMessage }) => {
  console.log(message, "messagemessagemessage");
  const MessageType = StyledImgAndVideo;
  if (
    message.text.includes(".jpg") ||
    message.text.includes(".heic") ||
    message.text.includes(".png") ||
    message.text.includes(".jpeg") ||
    message.text.includes(".svg") ||
    message.text.includes(".gif") ||
    message.text.includes(".mov") ||
    message.text.includes(".mp4") ||
    message.text.includes(".avi")
  ) {
    return (
      <MessageType>
        {message.text.includes(".jpg") ||
        message.text.includes(".heic") ||
        message.text.includes(".png") ||
        message.text.includes(".jpeg") ||
        message.text.includes(".svg") ||
        message.text.includes(".gif") ? (
          <StyledMessageImg
            src={message.text}
            alt="Message Image"
            onClick={() => window.open(message.text, "_blank")}
          />
        ) : message.text.includes(".mov") ||
          message.text.includes(".mp4") ||
          message.text.includes(".avi") ? (
          <video
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            src={message.text}
            controls
            autoPlay
          ></video>
        ) : (
          message.text
        )}
      </MessageType>
    );
  }
};

export default MessagesMedia;
