import { useRecipient } from "@/hooks/useRecipient";
import { AppUser, Conversation, IMessage } from "@/types";
import styled from "styled-components";
import RecipientAvatar from "./RecipientAvatar";
import {
  convertFirestoreTimestampToString,
  generateQueryGetMessages,
  transformMessage,
} from "@/utils/getMessagesInConversation";
import InfoIcon from "@mui/icons-material/Info";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { app, auth, db } from "@/config/firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import Message from "./Message";
import {
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import {
  DocumentReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import MessagesMedia from "./MessagesMedia";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Tooltip from "@mui/material/Tooltip";
import VideocamIcon from "@mui/icons-material/Videocam";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ShowUserGroup from "./ShowUserGroup";

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  align-items: center;
  padding: 11px;
  height: 80px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const StyledHeaderInfo = styled.div`
  margin-left: 10px;
  flex-grow: 1;
  > h3 {
    margin-top: 0;
    margin-bottom: 3px;
  }

  > span {
    font-size: 14px;
    color: gray;
  }
`;

const Notifi = styled.div`
  font-size: 14px;
  color: gray;
`;

const StyledH3 = styled.h3`
  width: 20%;
  overflow: hidden;
  display: -webkit-box;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
`;

const StyledHeaderIcon = styled.div`
  display: flex;
`;

const StyledMessageContainer = styled.div`
  padding: 30px 30px 30px 0;
  min-height: 90vh;
  position: relative;
`;

const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const StyledInput = styled.input`
  color: #000;
  flex-grow: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 15px;
  margin: 0 15px;
`;

const EndOfMessagesForAutoScroll = styled.div`
  margin-bottom: 30px;
`;

const StyledEmojiPicker = styled.div`
  position: absolute;
  bottom: 6%;
`;

const StyledContainer = styled.div`
  width: 100%;
  overflow-y: scroll;
  height: 100vh;
  ::-webkit-scrollbar {
    display: none;
  }
  -webkit-scrollbar-width: none;
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const StyledInfomation = styled.div`
  width: 30%;
  overflow-y: scroll;
  height: 100vh;
  padding-top: 20px;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  padding-left: 15px;
`;

const StyleSpanName = styled.div`
  padding: 10px 0;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  font-size: large;
`;

const StyledUserContent = styled.div``;

const StyleFileImg = styled.div`
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const StyledMedia = styled.div`
  display: none;
  &.show {
    display: block;
    padding-bottom: 10px;
  }
  &.showing {
    display: block;
    padding-bottom: 10px;
  }
`;

const StyledExpandMoreIcon = styled(ExpandMoreIcon)`
  transition: transform 0.3s ease-in-out;
  transform: rotate(0deg);

  &.expanded {
    transform: rotate(180deg);
  }

  &.expanding {
    transform: rotate(180deg);
  }
`;

const StyledMediaContent = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const StatusDot = styled.div`
  position: absolute;
  top: 70%;
  left: 50px;
  transform: translate(50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #42b72a;
  border-radius: 50%;
  z-index: 1;
`;

const StatusDot1 = styled.div`
  position: absolute;
  top: 65%;
  left: 40px;
  transform: translate(50%, -50%);
  width: 10px;
  height: 10px;
  background-color: #42b72a;
  border-radius: 50%;
  z-index: 1;
`;

const StyledPadding = styled.div`
  padding: 10px 0;
  text-align: center;
`;

const StyledCenter = styled.div`
  text-align: center;
  padding: 10px 0 20px 0;
`;

const InfoIconMr = styled(InfoIcon)`
  color: #0084ff;
`;

const InsertEmoticonIcon1 = styled(InsertEmoticonIcon)`
  color: #0084ff;
  font-size: xx-large;
`;

const SendIcon1 = styled(SendIcon)`
  color: #0084ff;
`;

const MicIcon1 = styled(MicIcon)`
  color: #0084ff;
`;

const VideocamIcon1 = styled(VideocamIcon)`
  color: #0084ff;
`;

const StopIcon1 = styled(StopIcon)`
  color: red;
`;

const AttachFileIcon1 = styled(AttachFileIcon)`
  color: #0084ff;
`;

const FolderOpenIcon1 = styled(FolderOpenIcon)`
  padding-right: 10px;
  font-size: xx-large;
`;

const SupervisorAccountIcon1 = styled(SupervisorAccountIcon)`
  padding-right: 10px;
  font-size: xx-large;
`;

const DeleteOutlineIcon1 = styled(DeleteOutlineIcon)`
  padding-right: 10px;
  font-size: xx-large;
`;

const StyledFlex = styled.div`
  display: flex;
  padding-bottom: 20px;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const ConversationScreen = ({
  conversation,
  messages,
}: {
  conversation: Conversation;
  messages: IMessage[];
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const conversationUsers = conversation.users;

  const { recipientEmails, recipients } = useRecipient(conversationUsers);

  const router = useRouter();
  const conversationId = router.query.id;
  const queryGetMessages = generateQueryGetMessages(conversationId as string);
  const [messagesSnapShot, messagesLoading, __error] =
    useCollection(queryGetMessages);

  console.log(messagesSnapShot, "messagesSnapShot");
  console.log(messagesLoading, "messagesLoading");

  const showMessages = () => {
    //neu dang load tin nhan
    if (messagesLoading) {
      return messages.map((message) => (
        <Message key={message.id} message={message} />
      ));
    }

    //neu da hoan thanh viec load tin nhan tu ssr
    if (messagesSnapShot) {
      return messagesSnapShot.docs.map((message) => (
        <Message key={message.id} message={transformMessage(message)} />
      ));
    }

    return null;
  };

  const showFileMedia = () => {
    //neu dang load tin nhan
    if (messagesLoading) {
      return messages.map((message) => (
        <MessagesMedia key={message.id} message={message} />
      ));
    }
    //neu da hoan thanh viec load tin nhan tu ssr
    if (messagesSnapShot) {
      if (messagesSnapShot.docs.length == 0) {
        <Notifi>Không có file phương tiện nào</Notifi>;
      } else {
        return messagesSnapShot.docs.map((message) => (
          <MessagesMedia key={message.id} message={transformMessage(message)} />
        ));
      }
    }

    return null;
  };

  const showUserGroup = () => {
    return (
      <ShowUserGroup
        dataGroup={dataGroup}
        recipients={recipients}
        recipientEmails={recipientEmails}
      />
    );
  };

  const deleteMess: MouseEventHandler<HTMLDivElement> = async () => {
    try {
      //lay data trong collect messages
      const querySnapshot = await getDocs(collection(db, "messages"));
      querySnapshot.forEach(async (docSnapshot) => {
        // lay ra cac id trong collect messages
        const messagesId = docSnapshot.id;
        // lấy data trong từng id
        const dataMess = doc(db, "messages", messagesId);
        const getDocumentDataMess = await getDoc(dataMess);
        const documentDataMess = getDocumentDataMess.data();
        if (documentDataMess) {
          // lấy conversation_id để so sánh với id trong collect user
          const conversationIdMess = documentDataMess.conversation_id;
          if (conversationId == conversationIdMess) {
            const documentMessRef: DocumentReference = doc(
              collection(db, "messages"),
              messagesId as string
            );
            await deleteDoc(documentMessRef);
          }
        }
      });
      // Tạo đối tượng tài liệu với collection và ID tương ứng
      const documentRef: DocumentReference = doc(
        collection(db, "conversations"),
        conversationId as string
      );
      // Xóa tài liệu
      await deleteDoc(documentRef);

      const querySnapshot3 = await getDocs(collection(db, "conversations"));
      let firstMessageId2 = "";
      if (querySnapshot3.docs.length == 0) {
        window.location.href = `http://localhost:3000/`;
      } else {
        querySnapshot3.forEach(async (docSnapshot) => {
          if (!firstMessageId2) {
            const messagesId2 = docSnapshot.id;
            window.location.href = `http://localhost:3000/conversations/${messagesId2}`;
            return;
          }
        });
      }
    } catch (error) {
      console.error("Lỗi khi xóa tài liệu:", error);
    }
  };

  const addMessageToDbAndUpdateLastSeen = async () => {
    //update thowfi gian xem cuoi cua user
    await setDoc(
      doc(db, "user", loggedInUser?.email as string),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );

    //them tin nhan khi nhan tin vao messages
    const messageRef = await addDoc(collection(db, "messages"), {
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text: newMessage,
      user: loggedInUser?.email,
    });

    setNewMessage("");

    scrollToBottom();
  };

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!newMessage) return;
      addMessageToDbAndUpdateLastSeen();
    }
  };

  const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    if (!newMessage) return;
    addMessageToDbAndUpdateLastSeen();
  };

  const handleSendMessage:
    | KeyboardEventHandler<HTMLInputElement>
    | MouseEventHandler<HTMLButtonElement> = isMac
    ? sendMessageOnEnter
    : sendMessageOnClick;

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const storage = getStorage(app);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [isURLUploaded, setIsURLUploaded] = useState(false);

  const metadata = {
    contentType: "image/jpg",
    contentType1: "image/png",
    contentType2: "image/jpeg",
    contentType3: "image/svg",
    contentType4: "image/heic",
    contentType5: "image/gif",
    contentType6: "video/mov",
    contentType7: "video/mp4",
    contentType8: "video/avi",
  };
  useEffect(() => {
    const fetchData = async () => {
      if (selectedFile) {
        if (
          selectedFile.name.includes(".jpg") ||
          selectedFile.name.includes(".heic") ||
          selectedFile.name.includes(".png") ||
          selectedFile.name.includes(".jpeg") ||
          selectedFile.name.includes(".svg") ||
          selectedFile.name.includes(".gif")
        ) {
          const storageRef = ref(storage, `files/${selectedFile.name}`);
          const uploadTask = await uploadBytes(
            storageRef,
            selectedFile,
            metadata
          );
          const downloadURL = await getDownloadURL(storageRef);
          setUploadedURL(downloadURL);
          setIsURLUploaded(true);
        } else if (
          selectedFile.name.includes(".mp4") ||
          selectedFile.name.includes(".mov") ||
          selectedFile.name.includes(".avi")
        ) {
          const storageRef = ref(storage, `videos/${selectedFile.name}`);
          const uploadTask = await uploadBytes(
            storageRef,
            selectedFile,
            metadata
          );
          const downloadURL = await getDownloadURL(storageRef);
          setUploadedURL(downloadURL);
          setIsURLUploaded(true);
        } else {
          alert("định dạng tệp không được hỗ trợ");
        }
      }
    };
    fetchData();
  }, [selectedFile]);

  const handleAttachFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const addImgToDbAndUpdateLastSeen = async () => {
    if (isURLUploaded) {
      //update thowfi gian xem cuoi cua user
      await setDoc(
        doc(db, "user", loggedInUser?.email as string),
        {
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );
      //them tin nhan khi nhan tin vao messages\
      await addDoc(collection(db, "messages"), {
        conversation_id: conversationId,
        sent_at: serverTimestamp(),
        text: uploadedURL,
        user: loggedInUser?.email,
      });

      setIsURLUploaded(false);

      scrollToBottom();
    }
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isFirstRender.current) {
      if (uploadedURL != null || uploadedURL !== "") {
        addImgToDbAndUpdateLastSeen();
      }
    } else {
      isFirstRender.current = false;
    }
  }, [isURLUploaded]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [showInfo, setShowInfo] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expanding, setExpanding] = useState(false);

  const toggleMedia = () => {
    setShowMedia(!showMedia);
    setExpanded(!expanded);
  };

  const toggleUser = () => {
    setShowUser(!showUser);
    setExpanding(!expanding);
  };

  const insertEmoji = (emoji: any) => {
    const textarea = document.getElementById(
      "message-input"
    ) as HTMLTextAreaElement;

    const { selectionStart, selectionEnd } = textarea;

    const message =
      newMessage.slice(0, selectionStart) +
      emoji +
      newMessage.slice(selectionEnd);

    setNewMessage(message);
  };

  const handleEmojiSelect = (emoji: any) => {
    insertEmoji(emoji.native);

    setShowEmojiPicker(false);
  };

  //chuc nang ghi am
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [isRecordingComplete, setIsRecordingComplete] = useState(false);

  const handleClick = async () => {
    if (isRecording) {
      if (mediaRecorder) {
        // Dừng ghi âm
        mediaRecorder.stop();
        setIsRecording(false);

        // Reset các biến trạng thái
        setStream(null);
        setMediaRecorder(null);
        setChunks([]);
      }
    } else {
      try {
        // Truy cập vào microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setStream(stream);

        // Bắt đầu ghi âm
        const mediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(mediaRecorder);
        setChunks([]);
        mediaRecorder.addEventListener("dataavailable", (e) => {
          if (e.data.size > 0) {
            setChunks((prevChunks) => [...prevChunks, e.data]);
          }
        });

        mediaRecorder.addEventListener("stop", () => {
          setIsRecordingComplete(true);
        });

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Lỗi khi truy cập microphone:", error);
      }
    }
  };

  useEffect(() => {
    const uploadData = async () => {
      if (isRecordingComplete && chunks.length > 0) {
        // Tạo Blob từ các mảnh đã ghi âm
        const recordingBlob = new Blob(chunks, { type: "audio/mpeg" });
        await uploadRecording(recordingBlob);

        // Reset các biến trạng thái
        setStream(null);
        setMediaRecorder(null);
        setChunks([]);
        setIsRecordingComplete(false);

        // Lưu trữ file ghi âm lên Firebase Storage
      }
    };

    uploadData();
  }, [isRecordingComplete, chunks]);

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 1000000);
  };

  const uploadRecording = async (recordingBlob: Blob) => {
    const randomNumber = generateRandomNumber();
    const storageRef = ref(storage, `recordings/${randomNumber}.mp3`);
    const uploadTask = await uploadBytes(storageRef, recordingBlob);
    const downloadURL = await getDownloadURL(storageRef);
    await addMp3ToDbAndUpdateLastSeen(downloadURL);
  };

  const addMp3ToDbAndUpdateLastSeen = async (downloadURL: string) => {
    if (downloadURL) {
      //update thowfi gian xem cuoi cua user
      await setDoc(
        doc(db, "user", loggedInUser?.email as string),
        {
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );
      //them tin nhan khi nhan tin vao messages\
      await addDoc(collection(db, "messages"), {
        conversation_id: conversationId,
        sent_at: serverTimestamp(),
        text: downloadURL,
        user: loggedInUser?.email,
      });

      setIsURLUploaded(false);

      scrollToBottom();
    }
  };

  const [dataGroup, setDataGroup] = useState<string[]>([]);

  const checkGroup = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "conversations"));
      let isGroup = false;
      const promises = [];

      for (const docSnapshot of querySnapshot.docs) {
        const idConversations = docSnapshot.id;

        if (idConversations === conversationId) {
          const dataConversations = doc(db, "conversations", idConversations);
          const promise = getDoc(dataConversations);
          promises.push(promise);
        }
      }

      const documentSnapshots = await Promise.all(promises);

      for (const docSnapshot of documentSnapshots) {
        const documentDataConversations = docSnapshot.data();
        if (
          documentDataConversations &&
          documentDataConversations.key === "group"
        ) {
          isGroup = true;
          setDataGroup(documentDataConversations.users);
          break;
        }
      }
      return isGroup;
    } catch (error) {
      console.error("Lỗi khi xử lý:", error);
      return false;
    }
  };

  const [isGroup, setIsGroup] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const result = await checkGroup();
      setIsGroup(result);
    };

    fetchData();
  }, [conversationId]);

  const active = recipients?.some(
    (el) => convertFirestoreTimestampToString(el.lastSeen) === "Đang hoạt động"
  );

  return (
    <>
      <StyledContainer>
        <StyledRecipientHeader>
          <RecipientAvatar
            recipients={recipients}
            recipientEmails={recipientEmails}
          />
          {recipients?.length == 1 && (
            <div>
              {convertFirestoreTimestampToString(recipients[0].lastSeen) ===
                "Đang hoạt động" && <StatusDot />}
            </div>
          )}
          <StyledHeaderInfo>
            <StyledH3>
              {recipientEmails
                .map((recipientEmails) => {
                  let avatar = recipients?.find(
                    (el) => el.email === recipientEmails
                  );
                  if (avatar) return avatar.name;
                  else return recipientEmails;
                })
                .join(", ")}
            </StyledH3>
            {recipientEmails.length > 1 ? (
              active ? (
                <>
                  <StatusDot1 />
                  <span>Đang hoạt động</span>
                </>
              ) : (
                ""
              )
            ) : recipients && recipients[0] ? (
              <span>
                {convertFirestoreTimestampToString(recipients[0].lastSeen)}
              </span>
            ) : (
              ""
            )}
          </StyledHeaderInfo>

          <StyledHeaderIcon>
            <Tooltip title="Bắt đầu gọi video" placement="bottom">
              <IconButton
                onClick={() =>
                  alert("Tính năng vẫn đang trong quá trình phát triển")
                }
              >
                <VideocamIcon1 />
              </IconButton>
            </Tooltip>
            <Tooltip title="Thông tin về cuộc trò chuyện" placement="bottom">
              <IconButton onClick={() => setShowInfo(!showInfo)}>
                <InfoIconMr />
              </IconButton>
            </Tooltip>
          </StyledHeaderIcon>
        </StyledRecipientHeader>
        <StyledMessageContainer>
          {showMessages()}
          <EndOfMessagesForAutoScroll ref={endOfMessagesRef} />
        </StyledMessageContainer>

        {showEmojiPicker && (
          <StyledEmojiPicker>
            <Picker
              data={data}
              emojiSize={20}
              onEmojiSelect={handleEmojiSelect}
            />
          </StyledEmojiPicker>
        )}

        <StyledInputContainer>
          <Tooltip title="Chọn biểu tượng cảm xúc" placement="bottom">
            <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <InsertEmoticonIcon1 />
            </IconButton>
          </Tooltip>
          <StyledInput
            id="message-input"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={sendMessageOnEnter}
          />
          <Tooltip title="Nhấn Enter để gửi" placement="bottom">
            <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
              <SendIcon1 />
            </IconButton>
          </Tooltip>
          <Tooltip title="Gửi clip âm thanh" placement="bottom">
            <IconButton onClick={handleClick}>
              {isRecording ? <StopIcon1 /> : <MicIcon1 />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Đính kèm file" placement="bottom">
            <IconButton>
              <input
                type="file"
                accept="image/*, video/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileInputChange}
              />
              <AttachFileIcon1 onClick={handleAttachFileClick} />
            </IconButton>
          </Tooltip>
        </StyledInputContainer>
      </StyledContainer>

      {showInfo && (
        <StyledInfomation>
          <StyledCenter>
            <div className="Avata_info_group">
              <RecipientAvatar
                recipients={recipients}
                recipientEmails={recipientEmails}
              />
            </div>
          </StyledCenter>
          <StyleSpanName>
            {recipientEmails
              .map((recipientEmails) => {
                let avatar = recipients?.find(
                  (el) => el.email === recipientEmails
                );
                if (avatar) return avatar.name;
                else return recipientEmails;
              })
              .toString()}

            {recipients?.length == 1 && (
              <div>
                {convertFirestoreTimestampToString(recipients[0].lastSeen) ===
                  "Đang hoạt động"}
              </div>
            )}
          </StyleSpanName>
          {recipientEmails.length > 1 ? (
            active ? (
              <>
                <StyledPadding>Đang hoạt động</StyledPadding>
              </>
            ) : (
              ""
            )
          ) : recipients && recipients[0] ? (
            ""
          ) : (
            ""
          )}
          {recipientEmails.length > 1 ? (
            active ? (
              ""
            ) : (
              ""
            )
          ) : recipients && recipients[0] ? (
            <StyledCenter>
              {convertFirestoreTimestampToString(recipients[0].lastSeen)}
            </StyledCenter>
          ) : (
            ""
          )}

          <StyledFlex onClick={toggleMedia}>
            <StyleFileImg>
              <FolderOpenIcon1 />
              File đã gửi
            </StyleFileImg>
            <StyledExpandMoreIcon className={expanded ? "expanded" : ""} />
          </StyledFlex>
          {/* show ra tệp đa gửi */}
          <StyledMedia className={showMedia ? "show" : ""}>
            <StyledMediaContent>{showFileMedia()}</StyledMediaContent>
          </StyledMedia>
          {/* hết */}
          {isGroup ? (
            <div>
              <StyledFlex onClick={toggleUser}>
                <StyleFileImg>
                  <SupervisorAccountIcon1 />
                  Thành viên trong nhóm
                </StyleFileImg>
                <StyledExpandMoreIcon
                  className={expanding ? "expanding" : ""}
                />
              </StyledFlex>
              <StyledMedia className={showUser ? "showing" : ""}>
                <StyledUserContent>{showUserGroup()}</StyledUserContent>
              </StyledMedia>
            </div>
          ) : (
            ""
          )}
          <StyledFlex>
            <StyleFileImg onClick={deleteMess}>
              <DeleteOutlineIcon1 />
              Xóa đoạn chat
            </StyleFileImg>
          </StyledFlex>
        </StyledInfomation>
      )}
    </>
  );
};

export default ConversationScreen;
