// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth,GoogleAuthProvider} from "firebase/auth"
import {getDatabase} from 'firebase/database';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnbwFFjg1ypIrpoLBCZP8VcNKj9oEQpCA",
  authDomain: "task-manager-c37ac.firebaseapp.com",
  projectId: "task-manager-c37ac",
  storageBucket: "task-manager-c37ac.appspot.com",
  messagingSenderId: "1080523966521",
  appId: "1:1080523966521:web:d92a99f7cf38cb01e925e8",
  measurementId: "G-DBDBLKZRKP"
};

// Initialize Firebase


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth=getAuth(app);
const provider=new GoogleAuthProvider();
const database = getDatabase(app);
export {auth,provider,database}