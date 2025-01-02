// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6iyQ6iiwTosWUeRRV9S86vSkSFVBAB2g",
  authDomain: "house-marketplace-app-ddae6.firebaseapp.com",
  projectId: "house-marketplace-app-ddae6",
  storageBucket: "house-marketplace-app-ddae6.firebasestorage.app",
  messagingSenderId: "423101116511",
  appId: "1:423101116511:web:8d4915006c1319beb5ebea"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db=getFirestore()