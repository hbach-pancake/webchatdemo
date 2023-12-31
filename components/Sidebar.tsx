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
import { TextField, DialogActions, Autocomplete, Chip } from "@mui/material";
import { useAuthState } from "react-firebase-hooks/auth";
import { KeyboardEventHandler, useEffect, useState } from "react";
import * as EmailValidator from "email-validator";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { Conversation } from "@/types";
import ConversationSelect from "./ConversationSelect";
import { useRouter } from "next/router";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";

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
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
`;

const StyledSearch = styled.div`
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 50px;
  border: 1px solid #fff;
  outline: none;
  background-color: #f0f2f5;
  width: 90%;
  margin: auto;
  margin-bottom: 10px;
`;

const StyledSearchInput = styled.input`
  color: #000;
  outline: none;
  border: none;
  flex: 1;
  background-color: #f0f2f5;
  padding-left: 5px;
`;

const StyledUserAvt = styled(Avatar)`
  cursor: pointer;
  :hover {
    opacity: 0.8;
  }
`;

const StyledFlex = styled.div``;

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

  const recipientEmailsArray = recipientEmail
    .split(",")
    .map((email) => email.trim());

  const queryGetConversationsForCurrentUser = query(
    collection(db, "conversations"),
    where("users", "array-contains", loggedInUser?.email)
  );

  const [conversationsSnapshot, __loading, __error] = useCollection(
    queryGetConversationsForCurrentUser
  );

  const isConversationAlreadyExists = (recipientEmails: string[]) =>
    !!conversationsSnapshot?.docs.find((conversation) => {
      const conversationUsers = (conversation.data() as Conversation).users;
      return (
        recipientEmails.every((email) => conversationUsers.includes(email)) &&
        conversationUsers.length === recipientEmails.length
      );
    });

  const isInvitingSelf =
    loggedInUser?.email !== null &&
    loggedInUser?.email !== undefined &&
    recipientEmailsArray.includes(loggedInUser.email);

  const isValidEmails = recipientEmailsArray.every((email) =>
    EmailValidator.validate(email)
  );

  const createConversation = async () => {
    if (!recipientEmail) return;

    if (isValidEmails) {
      if (!isConversationAlreadyExists(recipientEmailsArray)) {
        if (loggedInUser && loggedInUser.email) {
          recipientEmailsArray.unshift(loggedInUser.email);
          if (recipientEmailsArray.length > 2) {
            await addDoc(collection(db, "conversations"), {
              users: recipientEmailsArray,
              key: "group",
            });
          } else {
            await addDoc(collection(db, "conversations"), {
              users: recipientEmailsArray,
            });
          }
        }
      } else {
        alert("Cuộc trò truyện đã tồn tại, vui lòng kiểm tra lại");
      }
    } else {
      alert("email không hợp lệ, vui lòng kiểm tra lại");
    }
    closeNewConversationDialog();
  };

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

  // cos sawn recipientAvatar. khi click input thif render ra
  const logout = async () => {
    try {
      await signOut(auth);
      window.location.href = `https://webchatdemo.vercel.app/`;
    } catch (error) {
      console.log("Lỗi khi đăng xuất ", error);
    }
  };

  const [otherUsersEmails, setOtherUsersEmails] = useState<string[]>([]);

  const getOtherUsersEmails = async () => {
    const querySnapshot = await getDocs(collection(db, "conversations"));
    const otherUsersEmails: string[] = [];
    const temporarySet = new Set<string>(); // Mảng tạm thời để kiểm tra email trùng lặp

    await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const moreId = docSnapshot.id;
        const dataUserConversation = doc(db, "conversations", moreId);
        const getDocumentDataMess = await getDoc(dataUserConversation);
        const documentDataMess = getDocumentDataMess.data();

        if (documentDataMess) {
          const conversationIdMess = documentDataMess.users;

          if (conversationIdMess.includes(loggedInUser?.email)) {
            const otherEmails = conversationIdMess.filter(
              (email: any) => email !== loggedInUser?.email
            );

            // Loại bỏ các email trùng lặp trước khi thêm vào mảng
            otherEmails.forEach((email: string) => temporarySet.add(email));
          }
        }
      })
    );

    temporarySet.forEach((email: string) => otherUsersEmails.push(email)); // Thêm các email duy nhất vào mảng chính

    setOtherUsersEmails(otherUsersEmails);
  };

  console.log(otherUsersEmails, "otherUsersEmails");

  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);

  const [mail, setMail] = useState("");

  const handleEmailChange = (event: any) => {
    const { value } = event.target;
    setMail(value);

    const filteredSuggestions = otherUsersEmails.filter(
      (email: any) =>
        typeof value === "string" &&
        email.toLowerCase().includes(value.toLowerCase())
    );
    setEmailSuggestions(filteredSuggestions);
  };

  const handleEmailSelect = (
    event: React.ChangeEvent<{}>,
    value: string | null
  ) => {
    if (value) {
      setRecipientEmail((prevEmail) =>
        prevEmail ? prevEmail + "," + value : value
      );
      setMail("");
    }
  };

  const handleEmailDelete = (index: number) => {
    setRecipientEmail((prevEmail) => {
      const emails = prevEmail.split(",");
      emails.splice(index, 1);
      return emails.join(",");
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      await getOtherUsersEmails();
    };

    fetchData();
  }, []);

  return (
    <StyledContainer>
      <StyledHeader>
        <Tooltip title={loggedInUser?.email as string} placement="right">
          <StyledUserAvt src={loggedInUser?.photoURL || ""} />
        </Tooltip>
        <StyledFlex>
          <Tooltip title="Tạo cuộc trò chuyện mới" placement="bottom">
            <IconButton
              onClick={() => {
                toggleNewConversationDialog(true);
              }}
            >
              <PersonAddAlt1Icon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Đăng xuất" placement="bottom">
            <IconButton onClick={logout}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </StyledFlex>
      </StyledHeader>
      <StyledSearch>
        <SearchIcon />
        <StyledSearchInput
          value={recipientEmail}
          onChange={(event) => setRecipientEmail(event.target.value)}
          onKeyDown={findUserAndMessage}
          placeholder="Tìm kiếm cuộc trò chuyện"
        />
      </StyledSearch>
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
            Nhập địa chỉ email. Nếu tạo nhóm, bạn có thể nhập email và ENTER sau
            mỗi email nhập vào.
          </DialogContentText>
          <div>
            <Autocomplete
              freeSolo
              options={emailSuggestions}
              value={null}
              inputValue={mail}
              onInputChange={handleEmailChange}
              onChange={handleEmailSelect}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  label="Email Address"
                  type="email"
                  fullWidth
                  variant="standard"
                  value={mail}
                  onChange={handleEmailChange}
                />
              )}
            />
            <div>
              {recipientEmail.split(",").map((email, index) => (
                <Chip
                  key={index}
                  label={email}
                  onDelete={() => handleEmailDelete(index)}
                />
              ))}
            </div>
          </div>
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
