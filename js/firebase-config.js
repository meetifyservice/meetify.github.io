// Sprawdź, czy Firebase jest zainicjalizowane
window.firebaseInitialized = false;

// Sprawdź czy Firebase jest już zainicjalizowane
if (window.firebaseInitialized) {
    console.log('Firebase już zainicjalizowane');
    return;
}

// Konfiguracja Firebase
if (!window.firebaseConfig) {
    window.firebaseConfig = {
        apiKey: "AIzaSyDbRBqhDdj05vXy8oDhpDrU9l2RT3Iz3xs",
        authDomain: "meetify-bf45c.firebaseapp.com",
        projectId: "meetify-bf45c",
        storageBucket: "meetify-bf45c.appspot.com",
        messagingSenderId: "824652857715",
        appId: "1:824652857715:web:e4a4d0a0546490fcb58506"
    };
}

// Inicjalizacja Firebase
function initializeFirebase() {
    if (firebaseInitialized) {
        console.log('Firebase już zainicjalizowane');
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        try {
            console.log('Próba inicjalizacji Firebase');
            
            // Sprawdź czy konfiguracja jest zdefiniowana
            if (!firebaseConfig) {
                console.error('Firebase config nie jest zdefiniowany');
                throw new Error('Firebase config nie jest zdefiniowany');
            }

            // Sprawdź czy wszystkie wymagane pola konfiguracji są zdefiniowane
            const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
            const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
            if (missingFields.length > 0) {
                console.error('Brakujące pola w konfiguracji Firebase:', missingFields.join(', '));
                throw new Error('Brakujące pola w konfiguracji Firebase: ' + missingFields.join(', '));
            }

            // Inicjalizacja Firebase
            try {
                const app = firebase.initializeApp(firebaseConfig);
                console.log('Firebase zainicjalizowane');
                
                // Ustaw globalne referencje
                window.app = app;
                window.auth = firebase.auth(app);
                window.db = firebase.firestore(app);
                window.storage = firebase.storage(app);

                // Sprawdź czy wszystkie referencje są prawidłowe
                if (!window.app || !window.auth || !window.db || !window.storage) {
                    console.error('Nie wszystkie referencje są prawidłowe po inicjalizacji');
                    throw new Error('Nie wszystkie referencje są prawidłowe po inicjalizacji');
                }

                firebaseInitialized = true;
                resolve();
            } catch (error) {
                console.error('Błąd podczas inicjalizacji Firebase:', error.message);
                reject(error);
            }

        } catch (error) {
            console.error('Błąd podczas inicjalizacji Firebase:', error.message);
            reject(error);
        }
    });
}

// Sprawdź czy SDK jest gotowy do użycia
function checkFirebaseSDK() {
    // Sprawdź czy wszystkie wymagane moduły są załadowane
    if (typeof firebase === 'undefined' || typeof firebase.app === 'undefined' ||
        typeof firebase.auth === 'undefined' || typeof firebase.firestore === 'undefined' ||
        typeof firebase.storage === 'undefined') {
        console.log('Firebase SDK nie jest jeszcze załadowany');
        return false;
    }

    console.log('SDK Firebase jest gotowy do użycia');
    return true;
}

// Zainicjalizuj Firebase po załadowaniu DOM i gotowości SDK
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Sprawdź czy SDK jest załadowany
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK nie jest dostępny');
        }

        // Sprawdź czy SDK jest już zainicjalizowane
        if (window.firebaseInitialized) {
            console.log('Firebase już zainicjalizowane');
            // Wyślij event o zakończeniu inicjalizacji
            const event = new Event('firebase-initialized');
            window.dispatchEvent(event);
            return;
        }

        // Sprawdź czy konfiguracja jest już zdefiniowana
        if (!window.firebaseConfig) {
            throw new Error('Firebase config nie jest zdefiniowany');
        }

        // Dodaj opóźnienie przed inicjalizacją, aby upewnić się, że SDK jest gotowy
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Spróbuj zainicjalizować Firebase
        await initializeFirebase();
        console.log('Firebase zainicjalizowane');
        
        // Wyślij event o zakończeniu inicjalizacji
        const event = new Event('firebase-initialized');
        window.dispatchEvent(event);
    } catch (error) {
        console.error('Błąd podczas inicjalizacji Firebase:', error);
        // Import showMessage from utils.js and show error message
        const { showMessage } = await import('./utils/utils.js');
        showMessage('Błąd podczas inicjalizacji aplikacji. Proszę odświeżyć stronę.', 'error');
    }
});