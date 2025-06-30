// Konfiguracja Firebase - musisz dodać swoje dane
const firebaseConfig = {
	apiKey: "AIzaSyDbRBqhDdj05vXy8oDhpDrU9l2RT3Iz3xs",
	authDomain: "meetify-bf45c.firebaseapp.com",
	projectId: "meetify-bf45c",
	storageBucket: "meetify-bf45c.firebasestorage.app",
	messagingSenderId: "824652857715",
	appId: "1:824652857715:web:e4a4d0a0546490fcb58506",
};

// Inicjalizacja Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Referencje do elementów DOM
const loginScreen = document.getElementById('login-screen');
const profileScreen = document.getElementById('profile-screen');
const mainScreen = document.getElementById('main-screen');
const googleLoginBtn = document.getElementById('google-login');
const avatarInput = document.getElementById('avatar-input');
const avatarPreview = document.getElementById('avatar-preview');
const usernameInput = document.getElementById('username');
const saveProfileBtn = document.getElementById('save-profile');
const headerAvatar = document.getElementById('header-avatar');
const searchUserInput = document.getElementById('search-user');
const searchBtn = document.getElementById('search-btn');
const usersList = document.getElementById('users-list');
const chatContainer = document.getElementById('chat-container');

// Zmienne globalne
let currentUser = null;
let selectedUser = null;
let avatarFile = null;

// Obsługa logowania przez Google
googleLoginBtn.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then((result) => {
            currentUser = result.user;
            checkUserProfile();
        })
        .catch((error) => {
            console.error("Błąd logowania:", error);
            alert("Wystąpił błąd podczas logowania: " + error.message);
        });
});

// Sprawdzenie czy użytkownik ma już profil
function checkUserProfile() {
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                // Użytkownik ma już profil - przejdź do ekranu głównego
                showMainScreen();
                loadUserData();
            } else {
                // Użytkownik nie ma profilu - przejdź do ekranu tworzenia profilu
                showProfileScreen();
            }
        })
        .catch((error) => {
            console.error("Błąd sprawdzania profilu:", error);
        });
}

// Wyświetlanie ekranu tworzenia profilu
function showProfileScreen() {
    loginScreen.classList.remove('active');
    profileScreen.classList.add('active');
    mainScreen.classList.remove('active');
}

// Wyświetlanie ekranu głównego
function showMainScreen() {
    loginScreen.classList.remove('active');
    profileScreen.classList.remove('active');
    mainScreen.classList.add('active');
}

// Obsługa dodawania znajomych
function addFriend(userId) {
  db.collection('users').doc(currentUser.uid).update({
    friends: firebase.firestore.FieldValue.arrayUnion(userId)
  });
}

// Pobieranie listy znajomych
function loadFriends() {
  db.collection('users').doc(currentUser.uid).onSnapshot(doc => {
    const friends = doc.data().friends || [];
    // Wyświetl znajomych w UI
  });
}

// Obsługa wyboru zdjęcia profilowego
avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        avatarFile = file;
        const reader = new FileReader();
        reader.onload = (event) => {
            avatarPreview.innerHTML = `<img src="${event.target.result}" alt="Podgląd zdjęcia">`;
        };
        reader.readAsDataURL(file);
    }
});

// Zapisywanie profilu użytkownika
saveProfileBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    
    if (!username) {
        alert('Proszę podać nazwę użytkownika');
        return;
    }
    
    if (!avatarFile) {
        alert('Proszę wybrać zdjęcie profilowe');
        return;
    }
    
    // Sprawdź unikalność nazwy użytkownika
    db.collection('users').where('username', '==', username).get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                alert('Ta nazwa użytkownika jest już zajęta');
            } else {
                uploadAvatarAndSaveProfile(username);
            }
        })
        .catch((error) => {
            console.error("Błąd sprawdzania nazwy użytkownika:", error);
            alert('Wystąpił błąd podczas sprawdzania nazwy użytkownika');
        });
});

function uploadAvatarAndSaveProfile(username) {
    const storageRef = storage.ref(`avatars/${currentUser.uid}`);
    const uploadTask = storageRef.put(avatarFile);
    
    uploadTask.on('state_changed', 
        (snapshot) => {
            // Możesz dodać pasek postępu
        }, 
        (error) => {
            console.error("Błąd przesyłania zdjęcia:", error);
            alert('Wystąpił błąd podczas przesyłania zdjęcia');
        }, 
        () => {
            // Pobierz URL zdjęcia po udanym przesłaniu
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                // Zapisz dane użytkownika w Firestore
                db.collection('users').doc(currentUser.uid).set({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    username: username,
                    avatarUrl: downloadURL,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => {
                    showMainScreen();
                    loadUserData();
                })
                .catch((error) => {
                    console.error("Błąd zapisywania profilu:", error);
                    alert('Wystąpił błąd podczas zapisywania profilu');
                });
            });
        }
    );
}

// Ładowanie danych użytkownika
function loadUserData() {
    db.collection('users').doc(currentUser.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                // Wyświetl avatar w nagłówku
                headerAvatar.innerHTML = `<img src="${userData.avatarUrl}" alt="${userData.username}">`;
            }
        })
        .catch((error) => {
            console.error("Błąd ładowania danych użytkownika:", error);
        });
}

// Wyszukiwanie użytkowników
searchBtn.addEventListener('click', searchUsers);

function searchUsers() {
    const searchTerm = searchUserInput.value.trim().toLowerCase();
    
    if (!searchTerm) {
        alert('Proszę wprowadzić nazwę użytkownika do wyszukania');
        return;
    }
    
    usersList.innerHTML = '<p class="loading">Wyszukiwanie...</p>';
    
    db.collection('users')
        .where('username', '>=', searchTerm)
        .where('username', '<=', searchTerm + '\uf8ff')
        .get()
        .then((querySnapshot) => {
            usersList.innerHTML = '';
            
            if (querySnapshot.empty) {
                usersList.innerHTML = '<p class="no-results">Nie znaleziono użytkowników</p>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const user = doc.data();
                if (user.uid !== currentUser.uid) {
                    const userItem = document.createElement('div');
                    userItem.className = 'user-item';
                    userItem.innerHTML = `
                        <div class="user-item-avatar">
                            <img src="${user.avatarUrl}" alt="${user.username}">
                        </div>
                        <div class="user-item-name">${user.username}</div>
                    `;
                    userItem.addEventListener('click', () => startChat(user));
                    usersList.appendChild(userItem);
                }
            });
        })
        .catch((error) => {
            console.error("Błąd wyszukiwania użytkowników:", error);
            usersList.innerHTML = '<p class="error">Wystąpił błąd podczas wyszukiwania</p>';
        });
}

// Rozpoczęcie czatu z użytkownikiem
function startChat(user) {
    selectedUser = user;
    
    chatContainer.innerHTML = `
        <div class="chat-header">
            <div class="user-item-avatar">
                <img src="${user.avatarUrl}" alt="${user.username}">
            </div>
            <div class="user-item-name">${user.username}</div>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
            <input type="text" id="message-input" placeholder="Napisz wiadomość...">
            <button id="send-btn" class="btn">Wyślij</button>
        </div>
    `;
    
    chatContainer.style.display = 'block';
    loadMessages();
    
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Wysyłanie wiadomości
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    const chatId = generateChatId(currentUser.uid, selectedUser.uid);
    
    db.collection('chats').doc(chatId).collection('messages').add({
        senderId: currentUser.uid,
        receiverId: selectedUser.uid,
        text: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        messageInput.value = '';
    })
    .catch((error) => {
        console.error("Błąd wysyłania wiadomości:", error);
        alert('Wystąpił błąd podczas wysyłania wiadomości');
    });
}

// Ładowanie wiadomości
function loadMessages() {
    const chatId = generateChatId(currentUser.uid, selectedUser.uid);
    const chatMessages = document.getElementById('chat-messages');
    
    db.collection('chats').doc(chatId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
            chatMessages.innerHTML = '';
            
            snapshot.forEach((doc) => {
                const message = doc.data();
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`;
                messageDiv.textContent = message.text;
                chatMessages.appendChild(messageDiv);
            });
            
            // Przewiń na dół
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
}

// Generowanie unikalnego ID dla czatu
function generateChatId(userId1, userId2) {
    return userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;
}

// Sprawdź stan autentykacji przy załadowaniu strony
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        checkUserProfile();
    } else {
        // Użytkownik nie jest zalogowany
        loginScreen.classList.add('active');
        profileScreen.classList.remove('active');
        mainScreen.classList.remove('active');
    }
});
