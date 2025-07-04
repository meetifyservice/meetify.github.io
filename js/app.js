// Inicjalizacja Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Elementy DOM
const searchInput = document.getElementById('search-input');
const createPostBtn = document.getElementById('create-post-btn');
const notificationsBtn = document.getElementById('notifications-btn');
const messagesBtn = document.getElementById('messages-btn');
const profileBtn = document.getElementById('profile-btn');
const postsContainer = document.getElementById('posts-container');

// Funkcje pomocnicze
function formatDate(date) {
    return new Date(date).toLocaleString();
}

function createPostElement(postData) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
        <div class="post-header">
            <img src="${postData.avatar || 'images/default-avatar.png'}" class="post-avatar">
            <div>
                <h4>${postData.name}</h4>
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
