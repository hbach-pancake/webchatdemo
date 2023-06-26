// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  GoogleAuthProvider,
  getAuth,
  FacebookAuthProvider,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTPVSq_jpZJKpZSoxLwLWfHRdfw_xTWF4",
  authDomain: "appchatdemo-2101c.firebaseapp.com",
  projectId: "appchatdemo-2101c",
  storageBucket: "appchatdemo-2101c.appspot.com",
  messagingSenderId: "1030773466767",
  appId: "1:1030773466767:web:9ac8d95912d50361dcf2fa",
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

const getAuthProvider = (providerName: string) => {
  switch (providerName) {
    case "google":
      return new GoogleAuthProvider();
    case "facebook":
      return new FacebookAuthProvider();
    default:
      throw new Error("Unsupported provider");
  }
};

export { db, auth, getAuthProvider, app };
