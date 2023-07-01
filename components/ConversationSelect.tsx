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
  margin-right: 10px;
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

const StyledName = styled.span`
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

const ConversationSelect = ({
  id,
  conversationUsers,
}: {
  id: string;
  conversationUsers: Conversation["users"];
}) => {
  const { recipients, recipientEmails } = useRecipient(conversationUsers);
  const router = useRouter();

  const onSelectConversation = () => {
    router.push(`/conversations/${id}`);
  };

  const active = recipients?.some(
    (el) => convertFirestoreTimestampToString(el.lastSeen) === "Đang hoạt động"
  );
  return (
    <StyledContainer
      onClick={onSelectConversation}
      data-clicked={router.query.id === id}
    >
      <ConversationInfo>
        <RecipientAvatar
          recipients={recipients}
          recipientEmails={recipientEmails}
        />

        {recipientEmails.length > 1 ? (
          active ? (
            <StatusDot />
          ) : (
            ""
          )
        ) : recipients && recipients[0] ? (
          convertFirestoreTimestampToString(recipients[0].lastSeen) ===
            "Đang hoạt động" && <StatusDot />
        ) : (
          ""
        )}
      </ConversationInfo>
      <StyledName>
        {recipientEmails
          .map((recipientEmails) => {
            let avatar = recipients?.find((el) => el.email === recipientEmails);
            if (avatar) return avatar.name;
            else return recipientEmails;
          })
          .join(", ")}
      </StyledName>
    </StyledContainer>
  );
};

export default ConversationSelect;
