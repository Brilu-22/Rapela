import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 

// Your web app's Firebase configuration
// I have removed the databaseURL as it's for the Realtime Database
const firebaseConfig = {
apiKey: "AIzaSyB4xtSfpJEgBap_PUuI-5JQVMIjsFN_UGs",
  authDomain: "njpoiuy-9ca53.firebaseapp.com",
  databaseURL: "https://njpoiuy-9ca53-default-rtdb.firebaseio.com",
  projectId: "njpoiuy-9ca53",
  storageBucket: "njpoiuy-9ca53.firebasestorage.app",
  messagingSenderId: "292530341525",
  appId: "1:292530341525:web:905aca462b607c153d7d9c",
  measurementId: "G-PXZYWVV63D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// --- THIS IS THE KEY FIX ---
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);