import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import styled from "styled-components";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import { signOut } from "firebase/auth";
import { auth, db } from "@/config/firebase";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { TextField, DialogActions } from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import { KeyboardEventHandler, useState } from "react";
import * as EmailValidator from "email-validator";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { Conversation } from "@/types";
import ConversationSelect from "./ConversationSelect";
import { useRouter } from "next/router";

const StyledContainer = styled.div`
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;
  border-right: 1px solid whitesmoke;
  ::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
`;

const StyledSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-radius: 2px;
`;

const StyledSearchInput = styled.input`
  outline: none;
  border: none;
  flex: 1;
`;

const StyledSidebarButton = styled(Button)`
  width: 100%;
  border-top: 1px solid whitesmoke;
  border-bottom: 1px solid whitesmoke;
  font-weight: 700;
`;

const StyledUserAvt = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const Sidebar = () => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const [isOpenNewConversationDialog, setIsOpenNewConversationDialog] =
    useState(false);

  const [recipientEmail, setRecipientEmail] = useState("");

  const toggleNewConversationDialog = (isOpen: boolean) => {
    setIsOpenNewConversationDialog(isOpen);
    if (!isOpen) {
      setRecipientEmail("");
    }
  };

  const closeNewConversationDialog = () => {
    toggleNewConversationDialog(false);
  };

  const queryGetConversationsForCurrentUser = query(
    collection(db, "conversations"),
    where("users", "array-contains", loggedInUser?.email)
  );

  const [conversationsSnapshot, __loading, __error] = useCollection(
    queryGetConversationsForCurrentUser
  );

  const isConversationAlreadyExists = (recipientEmail: string) =>
    conversationsSnapshot?.docs.find((conversation) =>
      (conversation.data() as Conversation).users.includes(recipientEmail)
    );

  const isInvitingSelf = recipientEmail === loggedInUser?.email;
  const router = useRouter();

  const findUserAndMessage: KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!recipientEmail) return;
      renderMessageWithUser();
    }
  };

  const renderMessageWithUser = async () => {
    if (EmailValidator.validate(recipientEmail) && !isInvitingSelf) {
      const conversationsRef = collection(db, "conversations");
      const querySnapshot = await getDocs(conversationsRef);

      let matchingConversations = "";
      querySnapshot.forEach((doc) => {
        const conversation = doc.data();
        const users = conversation.users;

        if (
          users.includes(loggedInUser?.email) &&
          users.includes(recipientEmail)
        ) {
          matchingConversations = doc.id;
        }
      });
      return router.push(`/conversations/${matchingConversations}`);
    }
    return null;
  };

  const createConversation = async () => {
    if (!recipientEmail) return;

    if (
      EmailValidator.validate(recipientEmail) &&
      !isInvitingSelf &&
      !isConversationAlreadyExists(recipientEmail)
    ) {
      await addDoc(collection(db, "conversations"), {
        users: [loggedInUser?.email, recipientEmail],
      });
    } else {
      alert("email k hợp lệ");
    }
    closeNewConversationDialog();
  };
  // cos sawn recipientAvatar. khi click input thif render ra
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log("Lỗi khi đăng xuất ", error);
    }
  };
  return (
    <StyledContainer>
      <StyledHeader>
        <Tooltip title={loggedInUser?.email as string} placement="right">
          <StyledUserAvt src={loggedInUser?.photoURL || ""} />
        </Tooltip>
        <div>
          <IconButton onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </div>
      </StyledHeader>

      <StyledSearch>
        <SearchIcon />
        <StyledSearchInput
          value={recipientEmail}
          onChange={(event) => setRecipientEmail(event.target.value)}
          onKeyDown={findUserAndMessage}
          placeholder="Tìm kiếm"
        />
      </StyledSearch>

      <StyledSidebarButton
        onClick={() => {
          toggleNewConversationDialog(true);
        }}
      >
        Bắt đầu cuộc trò truyện mới
      </StyledSidebarButton>

      {conversationsSnapshot?.docs.map((conversation) => (
        <ConversationSelect
          key={conversation.id}
          id={conversation.id}
          conversationUsers={(conversation.data() as Conversation).users}
        />
      ))}

      <Dialog
        open={isOpenNewConversationDialog}
        onClose={closeNewConversationDialog}
      >
        <DialogTitle>Cuộc trò truyện mới</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Nhập địa chỉ email mà bạn muốn tạo trò chuyện.
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={recipientEmail}
            onChange={(event) => {
              setRecipientEmail(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewConversationDialog}>Hủy</Button>
          <Button disabled={!recipientEmail} onClick={createConversation}>
            Thêm mới
          </Button>
        </DialogActions>
      </Dialog>
    </StyledContainer>
  );
};

export default Sidebar;
