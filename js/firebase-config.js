// Sprawdź, czy Firebase jest zainicjalizowane
window.firebaseInitialized = false;

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
function initializeFirebase() {
    if (firebaseInitialized) {
        console.log('Firebase już zainicjalizowane');
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        try {
            console.log('Próba inicjalizacji Firebase');
            
            // Sprawdź, czy firebase jest zdefiniowane
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK nie jest załadowane');
            }

            // Sprawdź, czy firebase.initializeApp istnieje
            if (!firebase.initializeApp) {
                throw new Error('Firebase.initializeApp nie jest dostępne');
            }

            // Inicjalizacja Firebase
            const app = firebase.initializeApp(firebaseConfig);
            console.log('Firebase zainicjalizowane');
            
            // Ustaw globalne referencje
            window.app = app;
            
            // Użyj wersji kompatybilnej Firebase
            window.auth = firebase.auth();
            console.log('Firebase.auth zainicjalizowane');
            
            window.db = firebase.firestore();
            console.log('Firebase.firestore zainicjalizowane');
            
            window.storage = firebase.storage();
            console.log('Firebase.storage zainicjalizowane');
            
            firebaseInitialized = true;
            resolve();
        } catch (error) {
            console.error('Błąd podczas inicjalizacji Firebase:', error.message);
            reject(error);
        }
    });
}

// Zainicjalizuj Firebase po załadowaniu strony
window.addEventListener('load', async () => {
    try {
        await initializeFirebase();
        window.firebaseInitialized = true;
        // Wyślij event o zakończeniu inicjalizacji
        const event = new Event('firebase-initialized');
        window.dispatchEvent(event);
    } catch (error) {
        console.error('Błąd podczas inicjalizacji Firebase:', error);
        // Pokaż komunikat błędu użytkownikowi
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 5px; z-index: 1000;';
        errorDiv.textContent = 'Błąd podczas inicjalizacji aplikacji. Proszę odświeżyć stronę.';
        document.body.appendChild(errorDiv);
    }
});