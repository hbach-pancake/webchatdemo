import { useRecipient } from "@/hooks/useRecipient";
import { Conversation, IMessage } from "@/types";
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
import InfomationAvatar from "./InfomationAvatar";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import MessagesMedia from "./MessagesMedia";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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
  /* border-left: 1px solid #9e9e9e61;
  border-right: 1px solid #9e9e9e61; */
`;

const StyledHeaderInfo = styled.div`
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

const StyledH3 = styled.h3`
  word-break: break-all;
`;

const StyledHeaderIcon = styled.div`
  display: flex;
`;

const StyledMessageContainer = styled.div`
  padding: 30px;
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

const StyleSpan = styled.div`
  padding-top: 10px;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
`;

const StyleSpanName = styled.div`
  padding-top: 10px;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  font-size: large;
`;

const StyleSpanMail = styled.div`
  padding-top: 10px;
  text-align: center;
  cursor: pointer;
  font-size: medium;
`;

const StyleFileImg = styled.div`
  cursor: pointer;
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const StyledMedia = styled.div`
  width: 30%;
  overflow-y: scroll;
  height: 100vh;
  border-left: 1px solid rgba(0, 0, 0, 0.1);
`;

const StyledMediaHeader = styled.div`
  padding: 11px;
  height: 80px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const StyledFile = styled.span`
  font-weight: bold;
`;

const StyledMediaContent = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const StatusDot = styled.div`
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

const DeleteOutlineIcon1 = styled(DeleteOutlineIcon)`
  padding-right: 10px;
  font-size: xx-large;
`;

const StyledFlex = styled.div`
  display: flex;
  padding-bottom: 20px;
  justify-content: space-between;
  align-items: center;
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

  const { recipientEmail, recipient } = useRecipient(conversationUsers);

  const router = useRouter();
  const conversationId = router.query.id;
  const queryGetMessages = generateQueryGetMessages(conversationId as string);
  const [messagesSnapShot, messagesLoading, __error] =
    useCollection(queryGetMessages);

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
      return messagesSnapShot.docs.map((message) => (
        <MessagesMedia key={message.id} message={transformMessage(message)} />
      ));
    }

    return null;
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
        window.location.href = `http://localhost:3000`;
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
  const [showInfoImg, setShowInfoImg] = useState(false);

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
    console.log(downloadURL, "downloadURL");
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

  return (
    <>
      <StyledContainer>
        <StyledRecipientHeader>
          <RecipientAvatar
            recipient={recipient}
            recipientEmail={recipientEmail}
          />
          <StyledHeaderInfo>
            <StyledH3>{recipient?.name}</StyledH3>
            {recipient && (
              <div>
                <span>
                  {convertFirestoreTimestampToString(recipient.lastSeen)}
                </span>
                {convertFirestoreTimestampToString(recipient.lastSeen) ===
                  "Đang hoạt động" && <StatusDot />}
              </div>
            )}
          </StyledHeaderInfo>

          <StyledHeaderIcon>
            <IconButton onClick={() => setShowInfo(!showInfo)}>
              <InfoIconMr />
            </IconButton>
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
          <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <InsertEmoticonIcon1 />
          </IconButton>
          <StyledInput
            id="message-input"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={sendMessageOnEnter}
          />
          <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
            <SendIcon1 />
          </IconButton>
          <IconButton onClick={handleClick}>
            {isRecording ? <StopIcon1 /> : <MicIcon1 />}
          </IconButton>
          <IconButton>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />
            <AttachFileIcon1 onClick={handleAttachFileClick} />
          </IconButton>
        </StyledInputContainer>
      </StyledContainer>

      {showInfo && (
        <StyledInfomation>
          <InfomationAvatar
            recipient={recipient}
            recipientEmail={recipientEmail}
          />
          <StyleSpanName>{recipient?.name}</StyleSpanName>
          <StyleSpanMail>({recipientEmail})</StyleSpanMail>
          {recipient && (
            <StyledCenter>
              <div>{convertFirestoreTimestampToString(recipient.lastSeen)}</div>
              {convertFirestoreTimestampToString(recipient.lastSeen) ===
                "Đang hoạt động"}
            </StyledCenter>
          )}
          <StyledFlex>
            <StyleFileImg
              onClick={() => {
                setShowInfoImg(!showInfoImg);
                setShowInfo(!showInfo);
              }}
            >
              <FolderOpenIcon1 />
              File đã gửi{" "}
            </StyleFileImg>
            <ChevronRightIcon />
          </StyledFlex>
          <StyledFlex>
            <StyleFileImg onClick={deleteMess}>
              <DeleteOutlineIcon1 />
              Xóa đoạn chat
            </StyleFileImg>
          </StyledFlex>
        </StyledInfomation>
      )}

      {showInfoImg && (
        <StyledMedia>
          <StyledMediaHeader>
            <IconButton
              onClick={() => {
                setShowInfoImg(!showInfoImg);
                setShowInfo(!showInfo);
              }}
            >
              <KeyboardBackspaceIcon />
            </IconButton>
            <StyledFile>File đã gửi</StyledFile>
          </StyledMediaHeader>
          <StyledMediaContent>{showFileMedia()}</StyledMediaContent>
        </StyledMedia>
      )}
    </>
  );
};

export default ConversationScreen;
