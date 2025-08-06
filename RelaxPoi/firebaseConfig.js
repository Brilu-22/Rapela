import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; 
import { getDatabase } from 'firebase/database';


const firebaseConfig = {
  apiKey: "AIzaSyB4xtSfpJEgBap_PUuI-5JQVMIjsFN_UGs",
  authDomain: "njpoiuy-9ca53.firebaseapp.com",
  projectId: "njpoiuy-9ca53",
  storageBucket: "njpoiuy-9ca53.firebasestorage.app",
  messagingSenderId: "292530341525",
  appId: "1:292530341525:web:905aca462b607c153d7d9c",
  databaseURL: "https://njpoiuy-9ca53-default-rtdb.firebaseio.com/",
  measurementId: "G-PXZYWVV63D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getDatabase(app); 