// Sprawdź, czy Firebase jest zainicjalizowane
window.firebaseInitialized = false;

// Konfiguracja Firebase
if (!window.firebaseConfig) window.firebaseConfig = {
    apiKey: "AIzaSyDbRBqhDdj05vXy8oDhpDrU9l2RT3Iz3xs",
    authDomain: "meetify-bf45c.firebaseapp.com",
    projectId: "meetify-bf45c",
    storageBucket: "meetify-bf45c.appspot.com",
    messagingSenderId: "824652857715",
    appId: "1:824652857715:web:e4a4d0a0546490fcb58506"
};
const firebaseConfig = window.firebaseConfig;

// Inicjalizacja Firebase
async function initializeFirebase() {
    if (window.firebaseInitialized) {
        console.log('Firebase już zainicjalizowane');
        return;
    }

    try {
        console.log('Próba inicjalizacji Firebase');
        
        // Sprawdź czy konfiguracja jest zdefiniowana
        if (!firebaseConfig) {
            throw new Error('Firebase config nie jest zdefiniowany');
        }

        // Sprawdź czy wszystkie wymagane pola konfiguracji są zdefiniowane
        const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        const missingFields = requiredFields.filter(field => !firebaseConfig[field]);
        if (missingFields.length > 0) {
            throw new Error('Brakujące pola w konfiguracji Firebase: ' + missingFields.join(', '));
        }

        // Inicjalizacja Firebase
        const app = firebase.initializeApp(firebaseConfig);
        console.log('Firebase zainicjalizowane');
        
        // Ustaw globalne referencje
        window.app = app;
        window.auth = firebase.auth(app);
        window.db = firebase.firestore(app);
        window.storage = firebase.storage(app);

        // Sprawdź czy wszystkie referencje są prawidłowe
        if (!window.app || !window.auth || !window.db || !window.storage) {
            throw new Error('Nie wszystkie referencje są prawidłowe po inicjalizacji');
        }

        window.firebaseInitialized = true;
        
        // Wyślij event o zakończeniu inicjalizacji
        const event = new Event('firebase-initialized');
        window.dispatchEvent(event);
    } catch (error) {
        console.error('Błąd podczas inicjalizacji Firebase:', error);
        // Import showMessage from utils.js and show error message
        const { showMessage } = await import('./utils/utils.js');
        showMessage('Błąd podczas inicjalizacji aplikacji. Proszę odświeżyć stronę.', 'error');
        throw error; // Przekaż błąd dalej
    }
}

// Sprawdź czy SDK jest gotowy do użycia
function checkFirebaseSDK() {
    // Sprawdź czy główne moduły są załadowane
    if (
        typeof firebase === 'undefined' ||
        typeof firebase.app === 'undefined' ||
        typeof firebase.auth === 'undefined' ||
        typeof firebase.firestore === 'undefined' ||
        typeof firebase.storage === 'undefined'
    ) {
        console.log('Firebase SDK nie jest jeszcze załadowany');
        return false;
    }
    console.log('SDK Firebase jest gotowy do użycia');
    return true;
}

// Zainicjalizuj Firebase po załadowaniu DOM i gotowości SDK
window.addEventListener('DOMContentLoaded', () => {
    // Poczekaj aż wszystkie skrypty Firebase będą dostępne
    const waitForFirebaseSDK = setInterval(async () => {
        console.log('[Firebase SDK DEBUG]', {
            firebase: typeof window.firebase !== 'undefined',
            app: typeof window.firebase !== 'undefined' && typeof window.firebase.app !== 'undefined',
            auth: typeof window.firebase !== 'undefined' && typeof window.firebase.auth !== 'undefined',
            firestore: typeof window.firebase !== 'undefined' && typeof window.firebase.firestore !== 'undefined',
            storage: typeof window.firebase !== 'undefined' && typeof window.firebase.storage !== 'undefined',
        });
        if (
            typeof window.firebase !== 'undefined' &&
            typeof window.firebase.app !== 'undefined' &&
            typeof window.firebase.auth !== 'undefined' &&
            typeof window.firebase.firestore !== 'undefined' &&
            typeof window.firebase.storage !== 'undefined'
        ) {
            clearInterval(waitForFirebaseSDK);
            try {
                if (window.firebaseInitialized) {
                    console.log('Firebase już zainicjalizowane');
                    return;
                }
                if (!firebaseConfig) {
                    throw new Error('Firebase config nie jest zdefiniowany');
                }
                await initializeFirebase();
                console.log('Firebase zainicjalizowane');
            } catch (error) {
                console.error('Błąd podczas inicjalizacji Firebase:', error);
                const { showMessage } = await import('./utils/utils.js');
                showMessage('Błąd podczas inicjalizacji aplikacji. Proszę odświeżyć stronę.', 'error');
            }
        }
    }, 100);
});