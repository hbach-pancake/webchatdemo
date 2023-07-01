import { auth } from "@/config/firebase";
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

  console.log(newDataGroup, "newDataGroup");

  return (
    <>
      {newDataGroup.map((item: any, index: any) => {
        return (
          <StyledContainerFlex>
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
                <GroupRemoveIcon />
              </Tooltip>
            )}
            {item.email == loggedInUser?.email ? (
              <Tooltip title="Rời nhóm" placement="bottom">
                <ExitToAppIcon />
              </Tooltip>
            ) : (
              ""
            )}
          </StyledContainerFlex>
        );
      })}
      <StyledContainerFlex>
        <StyledContainerInfo>
          <AddIcon1 />
          <StyledUser>Thêm người</StyledUser>
        </StyledContainerInfo>
      </StyledContainerFlex>
      {/* <Dialog
        open={isOpenNewConversationDialog}
        onClose={closeNewConversationDialog}
      >
        <DialogTitle>Cuộc trò truyện mới</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Nhập địa chỉ email. Nếu tạo nhóm, bạn có thể nhập nhiều email và
            ngăn cách bởi dấu phẩy.
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
      </Dialog> */}
    </>
  );
};

export default ShowUserGroup;
