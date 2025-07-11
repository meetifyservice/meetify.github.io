// Inicjalizacja referencji Firebase
let auth;
let db;

// Inicjalizacja referencji Firebase
function initializeFirebaseReferences() {
    if (window.firebaseInitialized) {
        auth = getAuth();
        db = getFirestore();
        return true;
    }
    return false;
}

// Sprawdź czy Firebase jest gotowe
function isFirebaseReady() {
    return window.firebaseInitialized && auth && db;
}

// Logowanie
async function login(email, password) {
    try {
        // Sprawdź czy Firebase jest gotowe
        if (!isFirebaseReady()) {
            console.error('Firebase nie jest gotowy do użycia');
            throw new Error('Firebase nie jest gotowy do użycia');
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Błąd logowania:', error);
        throw error;
    }
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
        // Sprawdź czy Firebase jest zainicjalizowane
        if (!auth) {
            console.error('Firebase nie jest zainicjalizowane');
            return;
        }

        // Wyloguj użytkownika z Firebase
        await auth.signOut();
        
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
