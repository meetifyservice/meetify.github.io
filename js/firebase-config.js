const firebaseConfig = {
  apiKey: "AIzaSyDbRBqhDdj05vXy8oDhpDrU9l2RT3Iz3xs",
  authDomain: "meetify-bf45c.firebaseapp.com",
  projectId: "meetify-bf45c",
  storageBucket: "meetify-bf45c.appspot.com",
  messagingSenderId: "824652857715",
  appId: "1:824652857715:web:e4a4d0a0546490fcb58506"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();