import { db } from "@/config/firebase";
import { IMessage } from "@/types";
import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export const generateQueryGetMessages = (conversationId?: string) =>
  query(
    collection(db, "messages"),
    where("conversation_id", "==", conversationId),
    orderBy("sent_at", "asc")
  );

export const transformMessage = (
  message: QueryDocumentSnapshot<DocumentData>
) =>
  ({
    id: message.id,
    ...message.data(), //lay ra conversation_id, text, thoi gian , ng dung
    sent_at: message.data().sent_at
      ? convertFirestoreTimestampToNoti(message.data().sent_at as Timestamp)
      : null,
  } as IMessage);

export const convertFirestoreTimestampToNoti = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  const dateString = date.toLocaleDateString();
  const timeString = date.toLocaleTimeString();
  return `${timeString} - ${dateString}`;
};

export const convertFirestoreTimestampToString = (timestamp: Timestamp) => {
  const currentTime = new Date();
  const messageTime = timestamp.toDate();

  const millisecondsDiff = currentTime.getTime() - messageTime.getTime();
  const minutesDiff = millisecondsDiff / (1000 * 60);

  if (minutesDiff < 1) {
    return "Đang hoạt động";
  } else if (minutesDiff < 60) {
    return `Hoạt động ${Math.floor(minutesDiff)} phút trước`;
  } else if (minutesDiff < 1440) {
    const hoursDiff = Math.floor(minutesDiff / 60);
    return `Hoạt động ${hoursDiff} giờ trước`;
  } else {
    const daysDiff = Math.floor(minutesDiff / 1440);
    return `Hoạt động ${daysDiff} ngày trước`;
  }
};
