import { useRecipient } from "@/hooks/useRecipient";
import Avatar from "@mui/material/Avatar";
import styled from "styled-components";

type Props = ReturnType<typeof useRecipient>;

const StyledAvatar = styled(Avatar)`
  margin: auto;
  width: 100px;
  height: 100px;
`;

const InfomationAvatar = ({ recipient, recipientEmail }: Props) => {
  return recipient?.photoURL ? (
    <StyledAvatar src={recipient.photoURL} />
  ) : (
    <StyledAvatar>
      {recipientEmail && recipientEmail[0].toUpperCase()}
    </StyledAvatar>
  );
};

export default InfomationAvatar;
