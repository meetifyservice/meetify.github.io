// Inicjalizacja referencji Firebase
let auth;
let db;

// Inicjalizacja referencji Firebase
function initializeFirebaseReferences() {
    if (window.firebaseInitialized) {
        // Użyj wersji kompatybilnej Firebase
        auth = firebase.auth();
        db = firebase.firestore();
        return true;
    }
    return false;
}

// Sprawdź czy Firebase jest gotowe
function isFirebaseReady() {
    if (!window.firebaseInitialized) {
        console.error('Firebase nie jest zainicjalizowane');
        return false;
    }
    if (!window.app) {
        console.error('Firebase.app nie jest zainicjalizowane');
        return false;
    }
    if (!window.auth) {
        console.error('Firebase.auth nie jest zainicjalizowane');
        return false;
    }
    if (!window.db) {
        console.error('Firebase.firestore nie jest zainicjalizowane');
        return false;
    }
    return true;
}

// Sprawdź czy użytkownik jest zalogowany
function isUserLoggedIn() {
    try {
        // Sprawdź czy SDK jest gotowy do użycia
        if (!checkFirebaseSDK()) {
            console.error('SDK Firebase nie jest gotowy do sprawdzania statusu zalogowania');
            throw new Error('SDK Firebase nie jest gotowy do sprawdzania statusu zalogowania');
        }

        // Sprawdź czy SDK jest zainicjalizowane
        if (!window.auth) {
            console.error('Firebase.auth nie jest zainicjalizowane');
            return false;
        }

        // Sprawdź czy metoda currentUser jest dostępna
        if (!firebase.auth().currentUser) {
            console.log('Brak zalogowanego użytkownika');
            return false;
        }

        // Sprawdź czy użytkownik ma poprawne dane
        const user = firebase.auth().currentUser;
        if (!user.email) {
            console.error('Zalogowany użytkownik nie ma adresu email');
            return false;
        }

        if (!user.uid) {
            console.error('Zalogowany użytkownik nie ma UID');
            return false;
        }

        // Sprawdź czy użytkownik ma aktywną sesję
        if (!user.metadata.lastSignInTime) {
            console.error('Brak aktywnej sesji użytkownika');
            return false;
        }

        // Sprawdź czy użytkownik nie jest anonimowy
        if (user.isAnonymous) {
            console.error('Użytkownik jest anonimowy');
            return false;
        }

        console.log('Użytkownik jest zalogowany:', user.email);
        return true;
    } catch (error) {
        console.error('Błąd sprawdzania statusu zalogowania:', error);
        throw error;
    }
}

// Logowanie
async function login(email, password) {
    try {
        // Czekaj na zdarzenie inicjalizacji Firebase
        if (!window.firebaseInitialized) {
            console.log('Czekanie na inicjalizację Firebase...');
            return new Promise((resolve, reject) => {
                const observer = (event) => {
                    if (event.type === 'firebase-initialized') {
                        window.removeEventListener('firebase-initialized', observer);
                        resolve(login(email, password));
                    }
                };
                window.addEventListener('firebase-initialized', observer);
            });
        }

        // Sprawdź czy SDK jest gotowy do użycia
        if (!checkFirebaseSDK()) {
            console.error('SDK Firebase nie jest gotowy do logowania');
            throw new Error('SDK Firebase nie jest gotowy do logowania');
        }

        // Sprawdź czy metoda signInWithEmailAndPassword jest dostępna
        if (!firebase.auth().signInWithEmailAndPassword) {
            console.error('signInWithEmailAndPassword nie jest dostępny');
            throw new Error('signInWithEmailAndPassword nie jest dostępny');
        }

        // Sprawdź poprawność danych wejściowych
        if (!email || !password) {
            console.error('Brakujące dane logowania');
            throw new Error('Brakujące dane logowania');
        }

        // Sprawdź czy email ma poprawny format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('Nieprawidłowy format email');
            throw new Error('Nieprawidłowy format email');
        }

        // Sprawdź czy hasło ma odpowiednią długość
        if (password.length < 6) {
            console.error('Hasło musi mieć co najmniej 6 znaków');
            throw new Error('Hasło musi mieć co najmniej 6 znaków');
        }

        // Sprawdź czy SDK jest zainicjalizowane
        if (!window.auth) {
            console.error('Firebase.auth nie jest zainicjalizowane');
            throw new Error('Firebase.auth nie jest zainicjalizowane');
        }

        // Sprawdź czy już jesteśmy zalogowani
        const currentUser = firebase.auth().currentUser;
        if (currentUser && currentUser.email === email) {
            console.log('Użytkownik jest już zalogowany');
            return currentUser;
        }

        // Spróbuj zalogować użytkownika
        try {
            const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Sprawdź czy użytkownik ma poprawne dane
            if (!user.email) {
                console.error('Zalogowany użytkownik nie ma adresu email');
                throw new Error('Zalogowany użytkownik nie ma adresu email');
            }

            if (!user.uid) {
                console.error('Zalogowany użytkownik nie ma UID');
                throw new Error('Zalogowany użytkownik nie ma UID');
            }

            // Sprawdź czy użytkownik ma aktywną sesję
            if (!user.metadata.lastSignInTime) {
                console.error('Brak aktywnej sesji użytkownika');
                throw new Error('Brak aktywnej sesji użytkownika');
            }

            console.log('Użytkownik zalogowany:', user.email);
            return user;
        } catch (error) {
            console.error('Błąd podczas logowania:', error);
            throw error;
        }
    } catch (error) {
        console.error('Błąd podczas logowania:', error);
        throw error;
    }
}

// Sprawdź czy SDK Firebase jest gotowy do użycia
function checkFirebaseSDK() {
    // Sprawdź czy SDK jest zainicjalizowane
    if (!window.firebaseInitialized) {
        console.log('Firebase nie jest jeszcze zainicjalizowane');
        return false;
    }

    // Sprawdź czy wszystkie wymagane referencje są dostępne
    if (!window.app || !window.auth || !window.db || !window.storage) {
        console.log('Brakujące referencje Firebase');
        return false;
    }

    // Sprawdź czy wszystkie wymagane metody są dostępne
    const requiredMethods = ['signOut', 'signInWithEmailAndPassword', 'createUserWithEmailAndPassword'];
    const missingMethods = requiredMethods.filter(method => typeof window.auth[method] !== 'function');
    if (missingMethods.length > 0) {
        console.log(`Brakujące metody Firebase: ${missingMethods.join(', ')}`);
        return false;
    }

    console.log('SDK Firebase jest gotowy do użycia');
    return true;
}

// Rejestracja
async function register(username, email, password, day, month, year, firstName, lastName, gender) {
    try {
        // Sprawdź czy Firebase jest gotowe
        if (!isFirebaseReady()) {
            console.error('Firebase nie jest gotowy do użycia');
            throw new Error('Firebase nie jest gotowy do użycia');
        }
        // Sprawdź poprawność danych
        if (!username || !email || !password || !day || !month || !year || !firstName || !lastName || !gender) {
            throw new Error('Wszystkie pola są wymagane');
        }

        // Upewnij się, że zmienne auth i db są zainicjalizowane
        if (!auth || typeof auth.createUserWithEmailAndPassword !== 'function') {
            initializeFirebaseReferences();
            if (!auth || typeof auth.createUserWithEmailAndPassword !== 'function') {
                throw new Error('Nie udało się uzyskać referencji Firebase Auth');
            }
        }

        // Sprawdź czy rok jest poprawny
        const birthDate = new Date(year, month - 1, day);
        if (birthDate > new Date()) {
            throw new Error('Data urodzenia nie może być w przyszłości');
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Zapisanie danych użytkownika w Firestore
        try {
            console.log('Próba zapisu do Firestore dla UID:', user.uid);
            const userData = {
                username: username,
                email: email,
                avatar: 'images/av.png',
                bio: '',
                posts: 0,
                followers: 0,
                following: 0,
                birthDate: birthDate.toISOString(),
                firstName: firstName,
                lastName: lastName,
                gender: gender,
                // Zapisujemy Timestamp Firestore
                createdAt: firebase.firestore.Timestamp.now()
            };
            console.log('Dane użytkownika:', userData);
            
            await db.collection('users').doc(user.uid).set(userData);
            console.log('Zapisano dane użytkownika pomyślnie');
        } catch (firestoreError) {
            console.error('Szczegóły błędu Firestore:', {
                message: firestoreError.message,
                code: firestoreError.code,
                name: firestoreError.name,
                stack: firestoreError.stack
            });
            throw new Error('Nie udało się zapisać danych użytkownika. Szczegóły: ' + firestoreError.message);
        }

        return user;
    } catch (error) {
        console.error('Błąd rejestracji:', error);
        throw error;
    }
}

// Logowanie z Google
async function googleSignIn() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Sprawdź czy użytkownik już istnieje
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            // Przekieruj do strony uzupełniania danych
            window.location.href = 'google-register.html';
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Błąd logowania:', error);
        throw error;
    }
}

// Rejestracja z Google
async function registerWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        // Utworzenie nowego profilu
        try {
            const userData = {
                username: user.displayName,
                email: user.email,
                avatar: user.photoURL || 'images/av.png',
                bio: '',
                posts: 0,
                followers: 0,
                following: 0,
                // Zapisujemy Timestamp Firestore
                createdAt: firebase.firestore.Timestamp.now()
            };
            
            await db.collection('users').doc(user.uid).set(userData);
            console.log('Zapisano dane użytkownika pomyślnie');
        } catch (firestoreError) {
            console.error('Szczegóły błędu Firestore:', {
                message: firestoreError.message,
                code: firestoreError.code,
                name: firestoreError.name,
                stack: firestoreError.stack
            });
            throw new Error('Nie udało się zapisać danych użytkownika. Szczegóły: ' + firestoreError.message);
        }

        return user;
    } catch (error) {
        console.error('Błąd rejestracji z Google:', error);
        throw error;
    }
}

// Wylogowanie
window.logout = async function() {
    try {
        // Sprawdź czy SDK jest gotowy do użycia
        if (!checkFirebaseSDK()) {
            console.error('Firebase SDK nie jest gotowy do użycia');
            throw new Error('Firebase SDK nie jest gotowy do użycia');
        }

        // Wyloguj użytkownika z Firebase
        await window.auth.signOut();
        
        // Czekaj na zakończenie wylogowania
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Przekieruj na stronę logowania
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Błąd wylogowania:', error);
        alert('Wystąpił błąd podczas wylogowywania. Spróbuj ponownie.');
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    // Obsługa formularza logowania
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await login(email, password);
                window.location.href = 'index.html';
            } catch (error) {
                alert('Błąd logowania: ' + error.message);
            }
        });
    }

    // Obsługa formularza rejestracji
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Pobierz wartości z formularza
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const day = parseInt(document.getElementById('day').value);
            const month = parseInt(document.getElementById('month').value);
            const year = parseInt(document.getElementById('year').value);
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const gender = document.getElementById('gender').value;

            // Sprawdź poprawność danych
            if (!username || !email || !password || !confirmPassword || !day || !month || !year || !firstName || !lastName || !gender) {
                alert('Wszystkie pola są wymagane!');
                return;
            }

            if (password !== confirmPassword) {
                alert('Hasła nie są takie same!');
                return;
            }

            // Sprawdź czy email ma poprawny format
            if (!email.includes('@') || !email.includes('.')) {
                alert('Nieprawidłowy format email!');
                return;
            }

            try {
                console.log('Próba rejestracji z danymi:', {
                    username, email, day, month, year, firstName, lastName, gender
                });
                await register(username, email, password, day, month, year, firstName, lastName, gender);
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Błąd rejestracji:', error);
                alert('Błąd rejestracji: ' + error.message);
            }
        });
    }

    // Obsługa pokazywania hasła
    const passwordFields = document.querySelectorAll('.password-container input[type="password"]');
    passwordFields.forEach(input => {
        const checkbox = input.closest('.password-container').querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            input.type = checkbox.checked ? 'text' : 'password';
        });
    });
});

// Jeśli DOM został już wczytany przed załadowaniem tego skryptu (np. skrypt został dodany dynamicznie),
// wywołaj obsługę zdarzenia ręcznie, aby zainicjalizować listenery przycisków.
if (document.readyState !== 'loading') {
    // Użyj setTimeout, aby mieć pewność, że listener DOMContentLoaded został już zarejestrowany powyżej
    setTimeout(() => {
        document.dispatchEvent(new Event('DOMContentLoaded'));
    }, 0);
}
