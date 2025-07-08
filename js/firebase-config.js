// Sprawdź, czy Firebase już jest zainicjalizowane
if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
    console.log('Firebase już zainicjalizowane');
} else {
    // Konfiguracja Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDbRBqhDdj05vXy8oDhpDrU9l2RT3Iz3xs",
        authDomain: "meetify-bf45c.firebaseapp.com",
        projectId: "meetify-bf45c",
        storageBucket: "meetify-bf45c.appspot.com",
        messagingSenderId: "824652857715",
        appId: "1:824652857715:web:e4a4d0a0546490fcb58506"
    };

    // Inicjalizacja Firebase
    firebase.initializeApp(firebaseConfig);
}

// Eksportuj potrzebne referencje
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();
export const FieldValue = firebase.firestore.FieldValue;