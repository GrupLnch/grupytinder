// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCOu-a77pcmlXwnKBgEm7SdJpqlpAeeLbA",
    authDomain: "grupytinder.firebaseapp.com",
    projectId: "grupytinder",
    storageBucket: "grupytinder.appspot.com",
    messagingSenderId: "316379143309",
    appId: "1:316379143309:web:6ff0cbf208f56a96edd6c4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default auth;