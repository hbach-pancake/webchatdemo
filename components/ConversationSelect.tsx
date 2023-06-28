import { useRecipient } from "@/hooks/useRecipient";
import { Conversation } from "@/types";
import styled from "styled-components";
import RecipientAvatar from "./RecipientAvatar";
import { useRouter } from "next/router";
import { convertFirestoreTimestampToString } from "@/utils/getMessagesInConversation";

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  word-break: break-all;

  :hover {
    background-color: #e9eaeb;
  }
  &[data-clicked="true"] {
    background-color: #eaf3ff;
  }
`;

const ConversationInfo = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const StatusDot = styled.div`
  position: absolute;
  top: 75%;
  right: 20px;
  transform: translate(50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #42b72a;
  border-radius: 50%;
`;

const ConversationSelect = ({
  id,
  conversationUsers,
}: {
  id: string;
  conversationUsers: Conversation["users"];
}) => {
  const { recipient, recipientEmail } = useRecipient(conversationUsers);
  const name = recipient?.name;
  const router = useRouter();

  const onSelectConversation = () => {
    router.push(`/conversations/${id}`);
  };
  if (!recipient || !recipientEmail) {
    return (
      <StyledContainer
        onClick={onSelectConversation}
        data-clicked={router.query.id === id}
      >
        <ConversationInfo>
          <RecipientAvatar
            recipient={recipient}
            recipientEmail={recipientEmail}
          />
        </ConversationInfo>
        <span>{recipientEmail}</span>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer
      onClick={onSelectConversation}
      data-clicked={router.query.id === id}
    >
      <ConversationInfo>
        <RecipientAvatar
          recipient={recipient}
          recipientEmail={recipientEmail}
        />
        {convertFirestoreTimestampToString(recipient.lastSeen) ===
          "Đang hoạt động" && <StatusDot />}
      </ConversationInfo>
      <span>{name}</span>
    </StyledContainer>
  );
};

export default ConversationSelect;
