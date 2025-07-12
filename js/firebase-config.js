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

    // Sprawdź czy SDK jest gotowy do użycia
    if (!checkFirebaseSDK()) {
        console.error('SDK Firebase nie jest gotowy do inicjalizacji');
        throw new Error('SDK Firebase nie jest gotowy do inicjalizacji');
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

            // Sprawdź czy SDK jest zainicjalizowane przed próbą inicjalizacji
            if (window.app || window.auth || window.db || window.storage) {
                console.error('Firebase już zainicjalizowane - nie próbuj ponownej inicjalizacji');
                throw new Error('Firebase już zainicjalizowane - nie próbuj ponownej inicjalizacji');
            }

            // Sprawdź czy SDK jest zainicjalizowane przez inny kod
            if (firebase.apps.length > 0) {
                console.error('Firebase już zainicjalizowane przez inny kod');
                throw new Error('Firebase już zainicjalizowane przez inny kod');
            }

            // Inicjalizacja Firebase
            try {
                const app = firebase.initializeApp(firebaseConfig);
                console.log('Firebase zainicjalizowane');
                
                // Ustaw globalne referencje
                window.app = app;
                
                // Użyj wersji kompatybilnej Firebase
                try {
                    window.auth = firebase.auth();
                    console.log('Firebase.auth zainicjalizowane');
                } catch (error) {
                    throw new Error('Nie udało się zainicjalizować firebase.auth: ' + error.message);
                }
                
                try {
                    window.db = firebase.firestore();
                    console.log('Firebase.firestore zainicjalizowane');
                } catch (error) {
                    throw new Error('Nie udało się zainicjalizować firebase.firestore: ' + error.message);
                }
                
                try {
                    window.storage = firebase.storage();
                    console.log('Firebase.storage zainicjalizowane');
                } catch (error) {
                    throw new Error('Nie udało się zainicjalizować firebase.storage: ' + error.message);
                }
                
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
    if (typeof firebase === 'undefined') {
        console.log('Firebase SDK nie jest jeszcze załadowane');
        return false;
    }
    
    if (!firebase.initializeApp) {
        console.log('Firebase.initializeApp nie jest jeszcze dostępne');
        return false;
    }

    if (!firebase.auth) {
        console.log('Firebase.auth nie jest jeszcze zdefiniowane');
        return false;
    }

    if (!firebase.firestore) {
        console.log('Firebase.firestore nie jest jeszcze zdefiniowane');
        return false;
    }

    if (!firebase.storage) {
        console.log('Firebase.storage nie jest jeszcze zdefiniowane');
        return false;
    }

    // Sprawdź czy wszystkie metody są dostępne
    if (!firebase.auth().signInWithEmailAndPassword) {
        console.log('signInWithEmailAndPassword nie jest jeszcze dostępny');
        return false;
    }

    if (!firebase.auth().createUserWithEmailAndPassword) {
        console.log('createUserWithEmailAndPassword nie jest jeszcze dostępny');
        return false;
    }

    if (!firebase.auth().signOut) {
        console.log('signOut nie jest jeszcze dostępny');
        return false;
    }

    if (!firebase.auth().currentUser) {
        console.log('currentUser nie jest jeszcze dostępny');
        return false;
    }

    console.log('SDK Firebase jest gotowy do użycia');
    return true;
}

// Zainicjalizuj Firebase po załadowaniu DOM i gotowości SDK
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Sprawdź czy SDK jest gotowy przed inicjalizacją
        if (!window.firebase) {
            throw new Error('Firebase SDK nie jest dostępny');
        }

        // Sprawdź czy wszystkie wymagane moduły są załadowane
        const requiredModules = ['auth', 'firestore', 'storage'];
        const missingModules = requiredModules.filter(module => !window.firebase[module]);
        if (missingModules.length > 0) {
            throw new Error(`Brakujące moduły Firebase: ${missingModules.join(', ')}`);
        }
        if (!checkFirebaseSDK()) {
            console.error('SDK Firebase nie jest gotowy do inicjalizacji');
            
            // Dodatkowe sprawdzenie dostępności metod
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK nie jest załadowane');
            } else if (!firebase.initializeApp) {
                console.error('Firebase.initializeApp nie jest dostępny');
            } else if (!firebase.auth) {
                console.error('Firebase.auth nie jest dostępny');
            } else if (!firebase.firestore) {
                console.error('Firebase.firestore nie jest dostępny');
            } else if (!firebase.storage) {
                console.error('Firebase.storage nie jest dostępny');
            }
            
            throw new Error('SDK Firebase nie jest gotowy do inicjalizacji');
        }

        // Sprawdź czy SDK jest już zainicjalizowane
        if (window.firebaseInitialized) {
            console.log('Firebase już zainicjalizowane');
            // Wyślij event o zakończeniu inicjalizacji
            const event = new Event('firebase-initialized');
            window.dispatchEvent(event);
            return;
        }

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