// Rejestracja
document.getElementById('registration-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const birthDay = parseInt(document.getElementById('birth-day').value);
    const birthMonth = parseInt(document.getElementById('birth-month').value);
    const birthYear = parseInt(document.getElementById('birth-year').value);
    const gender = document.getElementById('gender').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorMessage = document.getElementById('error-message');

    // Walidacja danych
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Hasła nie są zgodne!';
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = 'Hasło musi mieć co najmniej 6 znaków!';
        return;
    }

    try {
        // Sprawdź wiek
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 13);
        
        if (birthDate > minDate) {
            errorMessage.textContent = 'Musisz mieć co najmniej 13 lat!';
            return;
        }

        // Rejestracja w Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Zapisz dane użytkownika
        await db.collection('users').doc(userCredential.user.uid).set({
            firstName,
            lastName,
            birthDate: new Date(birthYear, birthMonth - 1, birthDay),
            gender,
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

        // Użyj funkcji handleRegistrationSuccess do przekierowania
        await handleRegistrationSuccess();
    } catch (error) {
        errorMessage.textContent = error.message;
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