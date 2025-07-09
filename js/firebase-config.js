// Sprawdź, czy Firebase jest zainicjalizowane
let firebaseInitialized = false;

function initializeFirebase() {
    if (firebaseInitialized) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        // Sprawdź czy Firebase jest zdefiniowane
        if (typeof firebase === 'undefined') {
            reject(new Error('Firebase nie jest zdefiniowane'));
            return;
        }

        // Sprawdź czy Firebase jest już zainicjalizowane
        if (firebase.apps.length > 0) {
            firebaseInitialized = true;
            resolve();
            return;
        }

        // Konfiguracja Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyDbRBqhDdj05vXy8oDhpDrU9l2RT3Iz3xs",
            authDomain: "meetify-bf45c.firebaseapp.com",
            projectId: "meetify-bf45c",
            storageBucket: "meetify-bf45c.appspot.com",
            messagingSenderId: "824652857715",
            appId: "1:824652857715:web:e4a4d0a0546490fcb58506"
        };

        try {
            // Inicjalizacja Firebase
            firebase.initializeApp(firebaseConfig);
            
            // Ustaw globalne referencje
            window.app = firebase.app();
            window.auth = firebase.auth();
            window.db = firebase.firestore();
            window.storage = firebase.storage();
            window.FieldValue = firebase.firestore.FieldValue;
            
            firebaseInitialized = true;
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Zainicjalizuj Firebase po załadowaniu strony
window.addEventListener('load', async () => {
    try {
        await initializeFirebase();
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