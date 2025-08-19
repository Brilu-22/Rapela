import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Use getFirestore for Cloud Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4xtSfpJEgBap_PUuI-5JQVMIjsFN_UGs",
  authDomain: "njpoiuy-9ca53.firebaseapp.com",
  projectId: "njpoiuy-9ca53",
  storageBucket: "njpoiuy-9ca53.appspot.com", // This is the correct format
  messagingSenderId: "292530341525",
  appId: "1:292530341525:web:905aca462b607c153d7d9c",
  measurementId: "G-PXZYWVV63D"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// --- THIS IS THE KEY FIX ---
// Initialize Cloud Firestore and export it as 'db'
export const db = getFirestore(app);