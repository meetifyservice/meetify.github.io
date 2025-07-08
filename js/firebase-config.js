// Sprawdź, czy Firebase jest zainicjalizowane
if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
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
    
    // Ustaw globalne referencje
    window.app = firebase.app();
    window.auth = firebase.auth();
    window.db = firebase.firestore();
    window.storage = firebase.storage();
    window.FieldValue = firebase.firestore.FieldValue;
}