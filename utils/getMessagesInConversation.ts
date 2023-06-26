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
      ? convertFirestoreTimestampToString(message.data().sent_at as Timestamp)
      : null,
  } as IMessage);

export const convertFirestoreTimestampToString = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  const dateString = date.toLocaleDateString();
  const timeString = date.toLocaleTimeString();
  return `${timeString} - ${dateString}`;
};
