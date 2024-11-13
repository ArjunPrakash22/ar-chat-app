// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYeF2-ERN8uKddz5LfoCDghZy-MUyZUFs",
  authDomain: "chat-app-b2a09.firebaseapp.com",
  projectId: "chat-app-b2a09",
  storageBucket: "chat-app-b2a09.firebasestorage.app",
  messagingSenderId: "399959788336",
  appId: "1:399959788336:web:925f24a07bce9731a2d6f5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };