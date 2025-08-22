import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyB4xtSfpJEgBap_PUuI-5JQVMIjsFN_UGs",
  authDomain: "njpoiuy-9ca53.firebaseapp.com",
  projectId: "njpoiuy-9ca53",
  storageBucket: "njpoiuy-9ca53.appspot.com", 
  messagingSenderId: "292530341525",
  appId: "1:292530341525:web:905aca462b607c153d7d9c",
  measurementId: "G-PXZYWVV63D"
};



const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);


export const db = getFirestore(app);
export const storage = getStorage(app);