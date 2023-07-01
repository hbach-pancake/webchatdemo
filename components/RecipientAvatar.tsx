import { useRecipient } from "@/hooks/useRecipient";
import Avatar from "@mui/material/Avatar";
import styled from "styled-components";

type Props = ReturnType<typeof useRecipient>;

const StyledAvatar = styled(Avatar)`
  margin: auto;
  position: relative;
  width: 50px;
  height: 50px;
`;

const RecipientAvatar = ({ recipients, recipientEmails }: Props) => {
  return (
    <div className={recipientEmails.length > 1 ? "doubleAvata" : ""}>
      {recipientEmails.map((recipientEmails, index) => {
        if (index < 2) {
          let avatar = recipients?.find((el) => el.email === recipientEmails);
          if (avatar)
            return (
              <StyledAvatar>
                {
                  <img
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                    src={avatar.photoURL}
                    alt="Recipient Avatar"
                  />
                }
              </StyledAvatar>
            );
          else
            return (
              <StyledAvatar>{recipientEmails[0].toUpperCase()}</StyledAvatar>
            );
        }
      })}
      {}
    </div>
  );
};

export default RecipientAvatar;
