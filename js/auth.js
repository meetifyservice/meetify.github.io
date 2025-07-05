// Logowanie
async function login(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Błąd logowania:', error);
        throw error;
    }
}

// Rejestracja
async function register(name, email, password, day, month, year) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Utwórz datę urodzenia
        const birthDate = new Date(year, month - 1, day);
        const birthDateStr = birthDate.toISOString();

        // Zapisanie danych użytkownika w Firestore
        await db.collection('users').doc(user.uid).set({
            name: name,
            email: email,
            avatar: 'images/av.png',
            bio: '',
            posts: 0,
            followers: 0,
            following: 0,
            birthDate: birthDateStr,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

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
        await db.collection('users').doc(user.uid).set({
            name: user.displayName,
            email: user.email,
            avatar: user.photoURL || 'images/default-avatar.png',
            bio: '',
            posts: 0,
            followers: 0,
            following: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return user;
    } catch (error) {
        console.error('Błąd rejestracji z Google:', error);
        throw error;
    }
}

// Wylogowanie
async function logout() {
    try {
        // Wyloguj użytkownika z Firebase
        await auth.signOut();
        
        // Czekaj na zakończenie wylogowania
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Przekieruj na stronę logowania
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Błąd wylogowania:', error);
        throw error;
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
                window.location.href = 'app.html';
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
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Hasła nie są takie same!');
                return;
            }

            try {
                await register(name, email, password);
                window.location.href = 'app.html';
            } catch (error) {
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
