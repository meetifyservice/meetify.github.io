// Rejestracja
document.getElementById('registration-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Reset błędu
    errorMessage.textContent = '';

    // Walidacja danych
    if (!name) {
        errorMessage.textContent = 'Nazwa użytkownika jest wymagana!';
        return;
    }

    if (!email) {
        errorMessage.textContent = 'Email jest wymagany!';
        return;
    }

    if (!password) {
        errorMessage.textContent = 'Hasło jest wymagane!';
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = 'Hasło musi mieć co najmniej 6 znaków!';
        return;
    }

    try {
        // Sprawdź, czy email jest unikalny
        const existingUser = await db.collection('users')
            .where('email', '==', email)
            .get();

        if (!existingUser.empty) {
            errorMessage.textContent = 'Konto z tym adresem email już istnieje!';
            return;
        }

        // Rejestracja w Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Zapisz dane użytkownika
        await db.collection('users').doc(userCredential.user.uid).set({
            name,
            email,
            avatar: 'images/av.png',
            bio: '',
            interests: [],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'online',
            matches: [],
            chats: []
        });

        // Aktualizacja statusu i przekierowanie
        await db.collection('users').doc(userCredential.user.uid).update({
            status: 'online',
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });

        window.location.href = 'app.html';
    } catch (error) {
        let errorMessageText = '';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessageText = 'Konto z tym adresem email już istnieje!';
                break;
            case 'auth/invalid-email':
                errorMessageText = 'Nieprawidłowy adres email!';
                break;
            case 'auth/weak-password':
                errorMessageText = 'Hasło jest zbyt słabe!';
                break;
            case 'auth/user-not-found':
                errorMessageText = 'Nie znaleziono użytkownika!';
                break;
            case 'auth/wrong-password':
                errorMessageText = 'Nieprawidłowe hasło!';
                break;
            default:
                errorMessageText = error.message;
        }

        errorMessage.textContent = errorMessageText;
        console.error('Błąd:', error);
    }
});

// Logowanie
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Zaktualizuj status online
        await db.collection('users').doc(userCredential.user.uid).update({
            status: 'online',
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Użyj funkcji handleRegistrationSuccess do przekierowania
        await handleRegistrationSuccess();
    } catch (error) {
        errorMessage.textContent = error.message;
    }
});

// Obsługa wylogowania
function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Błąd przy wylogowywaniu:', error);
    });
}

// Sprawdź stan logowania
auth.onAuthStateChanged((user) => {
    if (user) {
        // Użytkownik jest zalogowany
        db.collection('users').doc(user.uid).update({
            status: 'online',
            lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
});

// Przekierowanie po rejestracji
async function handleRegistrationSuccess() {
    try {
        const user = auth.currentUser;
        if (user) {
            // Zaktualizuj status online
            await db.collection('users').doc(user.uid).update({
                status: 'online',
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
            window.location.href = 'app.html';
        }
    } catch (error) {
        console.error('Błąd podczas przekierowania po rejestracji:', error);
    }
}