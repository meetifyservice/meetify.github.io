import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDbRBqhDdj05vXy8oDhpDrU9l2RT3Iz3xs",
  authDomain: "meetify-bf45c.firebaseapp.com",
  projectId: "meetify-bf45c",
  storageBucket: "meetify-bf45c.appspot.com",
  messagingSenderId: "824652857715",
  appId: "1:824652857715:web:e4a4d0a0546490fcb58506"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();