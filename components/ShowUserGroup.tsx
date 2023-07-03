import { auth, db } from "@/config/firebase";
import { AppUser } from "@/types";
import { useAuthState } from "react-firebase-hooks/auth";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import styled from "styled-components";
import Avatar from "@mui/material/Avatar";
import AddIcon from "@mui/icons-material/Add";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { DialogActions, TextField } from "@mui/material";
import Button from "@mui/material/Button";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Tooltip from "@mui/material/Tooltip";
import { useState } from "react";
import * as EmailValidator from "email-validator";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/router";
import IconButton from "@mui/material/IconButton";

type Props = {
  dataGroup: string[];
  recipients: AppUser[] | undefined;
  recipientEmails: string[];
};

const StyledUser = styled.div`
  font-weight: bold;
`;

const StyledParam = styled.div`
  font-size: small;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

const StyledName = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
`;

const StyledAvatar = styled.img`
  border-radius: 50%;
  width: 35px;
`;

const StyledContainerInfo = styled.div`
  display: flex;
  align-items: center;
`;

const StyledContainerFlex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  :hover {
    background-color: #e9eaeb;
    border-radius: 15px;
  }
`;

const StyledAvatarNoImg = styled(Avatar)`
  width: 35px;
  height: 35px;
`;

const AddIcon1 = styled(AddIcon)`
  border: 1px solid #f0f2f5;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background-color: #f0f2f5;
  margin-right: 10px;
`;

const ShowUserGroup = ({ recipients, recipientEmails, dataGroup }: Props) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);
  // const cloneDataGroup = (dataGroup: string[]): string[] => {
  //   return dataGroup.slice();
  // };

  const newRecipients = recipients
    ? [
        ...recipients,
        {
          email: loggedInUser?.email,
          name: loggedInUser?.displayName,
          photoURL: loggedInUser?.photoURL,
        },
      ]
    : recipients;

  const newDataGroup = dataGroup.reduce((acc: any, item) => {
    let check = newRecipients?.find((el) => el.email == item);
    return check
      ? [...acc, check]
      : [...acc, { email: item, name: item, photoURL: null }];
  }, []);

  const [isOpenNewConversationDialog, setIsOpenNewConversationDialog] =
    useState(false);

  const [isOpenNotifi, setIsOpenNotifi] = useState(false);

  const [addrecipientEmail, setAddRecipientEmail] = useState("");

  const toggleNewConversationDialog = (isOpen: boolean) => {
    if (newDataGroup[0].email != loggedInUser?.email) {
      setIsOpenNotifi(isOpen);
    } else {
      setIsOpenNewConversationDialog(isOpen);
    }
    if (!isOpen) {
      setAddRecipientEmail("");
    }
  };

  const closeNewConversationDialog = () => {
    toggleNewConversationDialog(false);
  };

  const recipientEmailsArray = addrecipientEmail
    .split(",")
    .map((email) => email.trim());

  const isValidEmails = recipientEmailsArray.every((email) =>
    EmailValidator.validate(email)
  );

  const router = useRouter();
  const conversationsId: string =
    typeof router.query.id === "string" ? router.query.id : "";

  const checkEmailsExistence = (
    addrecipientEmail: string[],
    cloneDataGroup: string[]
  ): boolean => {
    return !addrecipientEmail.some((email) => cloneDataGroup.includes(email));
  };

  const addConversation = async () => {
    if (!addrecipientEmail) return;

    if (isValidEmails) {
      if (checkEmailsExistence(recipientEmailsArray, dataGroup)) {
        try {
          const mergedArray = [...dataGroup, ...recipientEmailsArray];
          const documentRef = doc(db, "conversations", conversationsId);
          await updateDoc(documentRef, {
            key: "group",
            users: mergedArray,
          });
          // router.reload();
        } catch (error) {
          console.error("Lỗi khi cập nhật dữ liệu:", error);
        }
      } else {
        alert("Người dùng đã có trong cuộc trò chuyện!");
      }
    } else {
      alert("email không hợp lệ, vui lòng kiểm tra lại");
    }
    router.reload();
    closeNewConversationDialog();
  };

  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedOutEmail, setSelectedOutEmail] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [outDialog, setOutDialog] = useState(false);

  const handleIconButtonClick = (email: any) => {
    setSelectedEmail(email);
    setOpenDialog(true);
  };

  const handleOutClick = (email: any) => {
    setSelectedOutEmail(email);
    setOutDialog(true);
  };

  const handleOutUser = async () => {
    const updatedDataGroup = dataGroup.filter(
      (item) => item !== selectedOutEmail
    );
    const documentRef = doc(db, "conversations", conversationsId);
    await updateDoc(documentRef, {
      key: "group",
      users: updatedDataGroup,
    });
    const querySnapshot = await getDocs(collection(db, "conversations"));
    querySnapshot.forEach(async (docSnapshot) => {
      // lay ra cac id trong collect conversation
      const moreId = docSnapshot.id;
      // lấy data trong từng id
      const dataUserConversation = doc(db, "conversations", moreId);
      const getDocumentDataMess = await getDoc(dataUserConversation);
      const documentDataMess = getDocumentDataMess.data();
      if (documentDataMess) {
        const conversationIdMess = documentDataMess.users;
        if (conversationIdMess.includes(loggedInUser?.email)) {
          const foundMoreId = moreId;
          return router.push(`/conversations/${foundMoreId}`);
        } else {
          return (window.location.href = `https://webchatdemo.vercel.app/`);
        }
      }
    });

    setOutDialog(false);
  };

  const handleDeleteUser = async () => {
    const updatedDataGroup = dataGroup.filter((item) => item !== selectedEmail);
    const documentRef = doc(db, "conversations", conversationsId);
    await updateDoc(documentRef, {
      key: "group",
      users: updatedDataGroup,
    });
    router.reload();
    setOpenDialog(false);
  };

  // console.log(dataGroup, "dataGroup");
  // console.log(newDataGroup, "newDataGroup");

  return (
    <>
      {newDataGroup.map((item: any, index: any) => {
        return (
          <StyledContainerFlex key={index}>
            <StyledContainerInfo>
              {item.photoURL ? (
                <StyledAvatar src={item.photoURL} />
              ) : (
                <StyledAvatarNoImg>
                  {item.name[0].toUpperCase()}
                </StyledAvatarNoImg>
              )}

              <StyledName>
                <StyledUser>{item.name}</StyledUser>
                <StyledParam>
                  {index == 0
                    ? "Người tạo nhóm"
                    : "Do " + newDataGroup[0].name + " thêm"}
                </StyledParam>
              </StyledName>
            </StyledContainerInfo>
            {newDataGroup[0].email != loggedInUser?.email || index == 0 ? (
              ""
            ) : (
              <Tooltip title="Xóa thành viên" placement="bottom">
                <IconButton onClick={() => handleIconButtonClick(item.email)}>
                  <GroupRemoveIcon />
                </IconButton>
              </Tooltip>
            )}
            {item.email == loggedInUser?.email ? (
              <Tooltip title="Rời nhóm" placement="bottom">
                <IconButton onClick={() => handleOutClick(item.email)}>
                  <ExitToAppIcon />
                </IconButton>
              </Tooltip>
            ) : (
              ""
            )}
          </StyledContainerFlex>
        );
      })}
      <StyledContainerFlex>
        <StyledContainerInfo
          onClick={() => {
            toggleNewConversationDialog(true);
          }}
        >
          <AddIcon1 />
          <StyledUser>Thêm người</StyledUser>
        </StyledContainerInfo>
      </StyledContainerFlex>
      <Dialog
        open={isOpenNewConversationDialog}
        onClose={closeNewConversationDialog}
      >
        <DialogTitle>Thêm thành viên</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Nhập địa chỉ email. Bạn có thể nhập nhiều email và ngăn cách bởi dấu
            phẩy.
          </DialogContentText>
          <TextField
            autoFocus
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={addrecipientEmail}
            onChange={(event) => {
              setAddRecipientEmail(event.target.value);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewConversationDialog}>Hủy</Button>
          <Button disabled={!addrecipientEmail} onClick={addConversation}>
            Thêm mới
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isOpenNotifi} onClose={closeNewConversationDialog}>
        <DialogTitle>Thông báo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Chỉ có chủ phòng mới thêm được thành viên
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNewConversationDialog}>Hủy</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        {/* Nội dung và các thành phần khác trong Dialog */}
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa thành viên có email: {selectedEmail}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={handleDeleteUser} autoFocus>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={outDialog} onClose={() => setOutDialog(false)}>
        {/* Nội dung và các thành phần khác trong Dialog */}
        <DialogTitle>Xác nhận rời đi</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn rời khỏi nhóm?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOutDialog(false)}>Hủy</Button>
          <Button onClick={handleOutUser} autoFocus>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShowUserGroup;
