// Inicjalizacja Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    // Obsługa wyszukiwania
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        searchUsers(query);
    });

    // Ukryj wyniki wyszukiwania po kliknięciu poza nimi
    document.addEventListener('click', (e) => {
        if (!searchResults.contains(e.target) && !searchInput.contains(e.target)) {
            hideSearchResults();
        }
    });

    // Pokaż wyniki wyszukiwania po kliknięciu w pole wyszukiwania
    searchInput.addEventListener('focus', () => {
        const query = searchInput.value;
        if (query.trim()) {
            searchUsers(query);
        }
    });
});

// Elementy DOM
const searchInput = document.getElementById('search-input');
const createPostBtn = document.getElementById('create-post-btn');
const notificationsBtn = document.getElementById('notifications-btn');
const messagesBtn = document.getElementById('messages-btn');
const profileBtn = document.getElementById('profile-btn');
const postsContainer = document.getElementById('posts-container');
const searchResults = document.getElementById('search-results');
const searchResultsContent = document.getElementById('search-results-content');
const addFriendBtn = document.getElementById('add-friend-btn');
const sendMessageBtn = document.getElementById('send-message-btn');

// Funkcje pomocnicze
function formatDate(date) {
    return new Date(date).toLocaleString();
}

// Funkcja do wyszukiwania użytkowników
async function searchUsers(query) {
    try {
        const usersRef = db.collection('users');
        const queryLower = query.toLowerCase();
        
        const snapshot = await usersRef.get();
        const results = [];
        
        snapshot.forEach(doc => {
            const user = doc.data();
            if (user.username.toLowerCase().includes(queryLower) ||
                user.firstName.toLowerCase().includes(queryLower) ||
                user.lastName.toLowerCase().includes(queryLower)) {
                results.push({
                    id: doc.id,
                    ...user
                });
            }
        });

        if (results.length > 0) {
            showSearchResults(results);
        } else {
            searchResultsContent.innerHTML = '<p style="color: var(--text-light);">Brak wyników wyszukiwania</p>';
        }
    } catch (error) {
        console.error('Błąd wyszukiwania użytkowników:', error);
        searchResultsContent.innerHTML = '<p style="color: var(--error-color);">Wystąpił błąd podczas wyszukiwania</p>';
    }
}

// Funkcja do wyświetlania wyników wyszukiwania
function showSearchResults(users) {
    searchResultsContent.innerHTML = users.map(user => `
        <div class="search-result-item" onclick="navigateToProfile('${user.id}')">
            <img src="${user.avatar || 'images/av.png'}" class="search-result-avatar" alt="Avatar">
            <div class="search-result-info">
                <div class="search-result-name">${user.firstName} ${user.lastName}</div>
                <div class="search-result-username">@${user.username}</div>
            </div>
        </div>
    `).join('');
    
    searchResults.style.display = 'block';
}

// Funkcja do ukrywania wyników wyszukiwania
function hideSearchResults() {
    searchResults.style.display = 'none';
}

// Funkcja do nawigacji do profilu
async function navigateToProfile(userId) {
    hideSearchResults();
    window.location.href = `profile.html?userId=${userId}`;
}

// Funkcja do dodawania znajomego
async function addFriend(userId) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('Musisz być zalogowany, aby dodać znajomego');
            return;
        }

        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        if (userData.following.includes(userId)) {
            alert('Już dodano tego użytkownika do znajomych');
            return;
        }

        await userRef.update({
            following: firebase.firestore.FieldValue.arrayUnion(userId)
        });

        await db.collection('users').doc(userId).update({
            followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
        });

        alert('Dodano użytkownika do znajomych!');
        addFriendBtn.disabled = true;
    } catch (error) {
        console.error('Błąd przy dodawaniu znajomego:', error);
        alert('Wystąpił błąd przy dodawaniu znajomego');
    }
}

// Funkcja do wysyłania wiadomości
async function sendMessage(userId) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('Musisz być zalogowany, aby wysłać wiadomość');
            return;
        }

        window.location.href = `messages.html?recipientId=${userId}`;
    } catch (error) {
        console.error('Błąd przy wysyłaniu wiadomości:', error);
        alert('Wystąpił błąd przy wysyłaniu wiadomości');
    }
}

// Funkcja do wyszukiwania użytkowników
async function searchUsers(query) {
    try {
        console.log('Próba wyszukiwania:', query);
        
        // Wyczyść poprzednie wyniki
        searchResultsContent.innerHTML = '';
        
        // Jeśli pole wyszukiwania jest puste, ukryj wyniki
        if (!query.trim()) {
            console.log('Pole wyszukiwania jest puste');
            hideSearchResults();
            return;
        }

        // Pobierz wyniki wyszukiwania
        const usersRef = db.collection('users');
        const queryLower = query.toLowerCase();
        console.log('Wyszukiwanie w kolekcji:', usersRef);
        
        // Wyszukaj użytkowników po nazwie użytkownika, imieniu lub nazwisku
        const snapshot = await usersRef.get();
        console.log('Pobrano dokumenty:', snapshot.docs.length);
        const results = [];
        
        snapshot.forEach(doc => {
            const user = doc.data();
            console.log('Sprawdzany użytkownik:', user);
            
            if (user.username?.toLowerCase()?.includes(queryLower) ||
                user.firstName?.toLowerCase()?.includes(queryLower) ||
                user.lastName?.toLowerCase()?.includes(queryLower)) {
                console.log('Znaleziono pasujący użytkownik:', user);
                results.push({
                    id: doc.id,
                    ...user
                });
            }
        });

        // Wyświetl wyniki
        if (results.length > 0) {
            console.log('Znaleziono użytkowników:', results);
            showSearchResults(results);
        } else {
            console.log('Brak wyników wyszukiwania');
            searchResultsContent.innerHTML = '<p style="color: var(--text-light);">Brak wyników wyszukiwania</p>';
        }
    } catch (error) {
        console.error('Błąd wyszukiwania użytkowników:', error);
        searchResultsContent.innerHTML = '<p style="color: var(--error-color);">Wystąpił błąd podczas wyszukiwania</p>';
    }
}

// Funkcja do wyświetlania wyników wyszukiwania
function showSearchResults(users) {
    searchResultsContent.innerHTML = users.map(user => `
        <div class="search-result-item" onclick="navigateToProfile('${user.id}')">
            <img src="${user.avatar || 'images/av.png'}" class="search-result-avatar" alt="Avatar">
            <div class="search-result-info">
                <div class="search-result-name">${user.firstName} ${user.lastName}</div>
                <div class="search-result-username">@${user.username}</div>
            </div>
        </div>
    `).join('');
    
    showSearchResults();
}

// Funkcja do pokazywania wyników wyszukiwania
function showSearchResults() {
    searchResults.style.display = 'block';
}

// Funkcja do ukrywania wyników wyszukiwania
function hideSearchResults() {
    searchResults.style.display = 'none';
}

// Funkcja do nawigacji do profilu
async function navigateToProfile(userId) {
    hideSearchResults();
    window.location.href = `profile.html?userId=${userId}`;
}

// Funkcja do dodawania znajomego
async function addFriend(userId) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('Musisz być zalogowany, aby dodać znajomego');
            return;
        }

        // Sprawdź, czy już dodano tego użytkownika
        const userRef = db.collection('users').doc(currentUser.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        
        if (userData.following.includes(userId)) {
            alert('Już dodano tego użytkownika do znajomych');
            return;
        }

        // Dodaj do znajomych
        await userRef.update({
            following: firebase.firestore.FieldValue.arrayUnion(userId)
        });

        // Dodaj do followers innego użytkownika
        await db.collection('users').doc(userId).update({
            followers: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
        });

        alert('Dodano użytkownika do znajomych!');
        addFriendBtn.disabled = true;
    } catch (error) {
        console.error('Błąd przy dodawaniu znajomego:', error);
        alert('Wystąpił błąd przy dodawaniu znajomego');
    }
}

// Funkcja do wysyłania wiadomości
async function sendMessage(userId) {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            alert('Musisz być zalogowany, aby wysłać wiadomość');
            return;
        }

        window.location.href = `messages.html?recipientId=${userId}`;
    } catch (error) {
        console.error('Błąd przy wysyłaniu wiadomości:', error);
        alert('Wystąpił błąd przy wysyłaniu wiadomości');
    }
}

function createPostElement(postData) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
        <div class="post-header">
            <img src="${postData.avatar || 'images/default-avatar.png'}" class="post-avatar">
            <div>
                <h4>@${postData.username}</h4>
                <span class="post-time">${formatDate(postData.timestamp)}</span>
            </div>
        </div>
        <div class="post-content">
            <p>${postData.content}</p>
            ${postData.image ? `<img src="${postData.image}" class="post-image">` : ''}
        </div>
        <div class="post-actions">
            <button class="action-btn">
                <i class="material-icons">thumb_up</i>
                <span>${postData.likes || 0}</span>
            </button>
            <button class="action-btn">
                <i class="material-icons">comment</i>
                <span>${postData.comments || 0}</span>
            </button>
            <button class="action-btn">
                <i class="material-icons">share</i>
                <span>${postData.shares || 0}</span>
            </button>
        </div>
    `;
    return postElement;
}

// Obsługa logowania
auth.onAuthStateChanged(user => {
    if (user) {
        // Użytkownik zalogowany
        loadUserProfile(user.uid);
        loadPosts();
    } else {
        // Użytkownik niezalogowany
        window.location.href = 'login.html';
    }
});

// Ładowanie profilu użytkownika
async function loadUserProfile(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('profile-btn').querySelector('img').src = userData.avatar || 'images/default-avatar.png';
            document.getElementById('profile-btn').querySelector('span').textContent = `@${userData.username}`;
        }
    } catch (error) {
        console.error('Błąd podczas ładowania profilu:', error);
    }
}

// Ładowanie postów
async function loadPosts() {
    try {
        const posts = await db.collection('posts').orderBy('timestamp', 'desc').get();
        postsContainer.innerHTML = '';
        posts.forEach(doc => {
            const postElement = createPostElement(doc.data());
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania postów:', error);
    }
}

// Dodawanie posta
async function addPost(content, image) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const postData = {
            content,
            image,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: user.uid,
            name: user.displayName || 'Użytkownik',
            avatar: user.photoURL || 'images/default-avatar.png',
            likes: 0,
            comments: 0,
            shares: 0
        };

        await db.collection('posts').add(postData);
        loadPosts();
    } catch (error) {
        console.error('Błąd podczas dodawania posta:', error);
    }
}

// Obsługa wyszukiwania
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length >= 2) {
        try {
            const results = await db.collection('users')
                .where('name', '>=', query)
                .where('name', '<=', query + '\uf8ff')
                .limit(5)
                .get();
            
            // Wyświetlanie wyników wyszukiwania
            displaySearchResults(results.docs);
        } catch (error) {
            console.error('Błąd podczas wyszukiwania:', error);
        }
    }
});

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', () => {
    // Sprawdź czy użytkownik jest zalogowany
    if (!auth.currentUser) {
        window.location.href = 'login.html';
    }
});
