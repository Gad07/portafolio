import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXJpgzb2E2oS_JfrkX3knCv8aVVkhiqho",
  authDomain: "portafolio-gadiel.firebaseapp.com",
  projectId: "portafolio-gadiel",
  storageBucket: "portafolio-gadiel.firebasestorage.app",
  messagingSenderId: "940229885891",
  appId: "1:940229885891:web:3ceae4a9ed283460e80776",
  measurementId: "G-9HWEW4X98B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
