import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrg4mp29kEgESy4sWEQ00mGkA4VqAc6LY",
  authDomain: "novaflow-3a9e7.firebaseapp.com",
  projectId: "novaflow-3a9e7",
  storageBucket: "novaflow-3a9e7.firebasestorage.app",
  messagingSenderId: "811619047379",
  appId: "1:811619047379:web:8908287431c7363f69c126",
  measurementId: "G-8R4W055C4S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);