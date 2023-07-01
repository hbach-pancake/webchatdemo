import { auth, db } from "@/config/firebase";
import { AppUser, Conversation } from "@/types";
import { getRecipientEmail } from "@/utils/getRecipientEmail";
import { collection, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

export const useRecipient = (conversationUsers: Conversation["users"]) => {
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const recipientEmails = getRecipientEmail(conversationUsers, loggedInUser);

  const queryGetRecipient = query(
    collection(db, "users"),
    where(
      "email",
      "in",
      recipientEmails.reduce((acc: any, email: any) => acc.concat([email]), [])
    )
  );

  const [recipientsSnapshot, __loading, __error] =
    useCollection(queryGetRecipient);

  const recipients = recipientsSnapshot?.docs.map((doc) => doc.data()) as
    | AppUser[]
    | undefined;

  return {
    recipients,
    recipientEmails,
  };
};
