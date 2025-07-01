// Sprawdź stan logowania
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        loadUserProfile(user.uid);
        loadPosts();
        setupEventListeners();
    }
});

// Ładowanie profilu użytkownika
async function loadUserProfile(uid) {
    try {
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            document.getElementById('user-avatar').src = userData.avatar;
            document.getElementById('user-avatar').addEventListener('click', () => {
                window.location.href = `profile.html?id=${uid}`;
            });
        }
    } catch (error) {
        console.error('Błąd podczas ładowania profilu:', error);
    }
}

// Ładowanie postów
async function loadPosts() {
    try {
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = ''; // Wyczyść poprzednie posty

        // Pobierz posty z bazy danych
        const postsSnapshot = await db.collection('posts')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        postsSnapshot.forEach(doc => {
            const post = doc.data();
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });

        // Dodaj scroll listener dla ładowania więcej postów
        window.addEventListener('scroll', handleScroll);
    } catch (error) {
        console.error('Błąd podczas ładowania postów:', error);
    }
}

// Tworzenie elementu posta
function createPostElement(post) {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `
        <div class="post-header">
            <img src="${post.authorAvatar}" class="post-avatar">
            <div class="post-author-info">
                <span class="post-author">${post.authorName}</span>
                <span class="post-time">${formatTime(post.createdAt)}</span>
            </div>
        </div>
        <div class="post-content">${post.content}</div>
        ${post.image ? `<img src="${post.image}" class="post-image">` : ''}
        <div class="post-actions">
            <button class="like-btn" data-post-id="${post.id}">
                <i class="material-icons">favorite_border</i>
            </button>
            <span class="likes-count">${post.likes || 0}</span>
            <button class="comment-btn" data-post-id="${post.id}">
                <i class="material-icons">chat_bubble_outline</i>
            </button>
        </div>
    `;
    return postElement;
}

// Formatowanie czasu posta
function formatTime(timestamp) {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diff = now - postTime;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
        return `${minutes}m temu`;
    } else if (hours < 24) {
        return `${hours}h temu`;
    } else {
        return `${days}d temu`;
    }
}

// Obsługa dodawania posta
async function handleAddPost(e) {
    e.preventDefault();
    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];
    const user = auth.currentUser;

    if (!content && !imageFile) {
        alert('Post musi zawierać tekst lub obraz!');
        return;
    }

    try {
        // Upload obrazu do Firebase Storage
        let imageUrl = '';
        if (imageFile) {
            const storageRef = storage.ref(`posts/${user.uid}/${Date.now()}_${imageFile.name}`);
            await storageRef.put(imageFile);
            imageUrl = await storageRef.getDownloadURL();
        }

        // Dodaj post do bazy danych
        await db.collection('posts').add({
            authorId: user.uid,
            authorName: `${user.firstName} ${user.lastName}`,
            authorAvatar: user.avatar,
            content,
            image: imageUrl,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            comments: []
        });

        // Resetuj formularz
        document.getElementById('post-content').value = '';
        document.getElementById('post-image').value = '';
        closeModal();

        // Odśwież posty
        loadPosts();
    } catch (error) {
        console.error('Błąd podczas dodawania posta:', error);
        alert('Wystąpił błąd podczas dodawania posta!');
    }
}

// Obsługa polubień
async function handleLike(postId) {
    try {
        const postRef = await db.collection('posts').doc(postId);
        const post = await postRef.get();
        
        if (post.exists) {
            const likes = post.data().likes || 0;
            await postRef.update({
                likes: likes + 1
            });
            
            // Odśwież posty
            loadPosts();
        }
    } catch (error) {
        console.error('Błąd podczas polubienia:', error);
    }
}

// Obsługa komentarzy
async function handleComment(postId) {
    try {
        const comment = prompt('Dodaj komentarz:');
        if (comment) {
            const user = auth.currentUser;
            const postRef = await db.collection('posts').doc(postId);
            
            await postRef.update({
                comments: firebase.firestore.FieldValue.arrayUnion({
                    userId: user.uid,
                    userName: `${user.firstName} ${user.lastName}`,
                    content: comment,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                })
            });
            
            // Odśwież posty
            loadPosts();
        }
    } catch (error) {
        console.error('Błąd podczas dodawania komentarza:', error);
    }
}

// Obsługa wyszukiwania
async function handleSearch(query) {
    try {
        const results = await db.collection('users')
            .where('firstName', '>=', query)
            .where('firstName', '<=', query + '\uf8ff')
            .get();

        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';

        results.forEach(doc => {
            const user = doc.data();
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result';
            resultElement.innerHTML = `
                <img src="${user.avatar}" class="search-avatar">
                <div class="search-info">
                    <h3>${user.firstName} ${user.lastName}</h3>
                    <p>${user.bio || 'Brak opisu'}</p>
                </div>
                <button onclick="handleMatch('${doc.id}')" class="match-btn">
                    <i class="material-icons">favorite_border</i>
                </button>
            `;
            searchResults.appendChild(resultElement);
        });
    } catch (error) {
        console.error('Błąd podczas wyszukiwania:', error);
    }
}

// Obsługa matchowania
async function handleMatch(userId) {
    try {
        const user = auth.currentUser;
        await db.collection('users').doc(user.uid).update({
            matches: firebase.firestore.FieldValue.arrayUnion(userId)
        });
        
        // Sprawdź, czy użytkownik też Cię polubił
        const otherUser = await db.collection('users').doc(userId).get();
        if (otherUser.exists && otherUser.data().matches.includes(user.uid)) {
            // Utwórz czat
            const chatId = [user.uid, userId].sort().join('_');
            await db.collection('chats').doc(chatId).set({
                users: [user.uid, userId],
                messages: []
            });
            
            // Dodaj czat do listy użytkowników
            await db.collection('users').doc(user.uid).update({
                chats: firebase.firestore.FieldValue.arrayUnion(chatId)
            });
            await db.collection('users').doc(userId).update({
                chats: firebase.firestore.FieldValue.arrayUnion(chatId)
            });
        }
    } catch (error) {
        console.error('Błąd podczas matchowania:', error);
    }
}

// Obsługa wiadomości
async function sendMessage(chatId, message) {
    try {
        const user = auth.currentUser;
        await db.collection('chats').doc(chatId).update({
            messages: firebase.firestore.FieldValue.arrayUnion({
                userId: user.uid,
                content: message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            })
        });
    } catch (error) {
        console.error('Błąd podczas wysyłania wiadomości:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Obsługa przycisku dodawania posta
    document.getElementById('add-post-btn').addEventListener('click', () => {
        document.getElementById('post-modal').style.display = 'block';
    });

    // Obsługa przycisku wyszukiwania
    document.getElementById('search-btn').addEventListener('click', () => {
        document.getElementById('search-modal').style.display = 'block';
    });

    // Obsługa zamykania modalów
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Obsługa kliknięcia poza modalami
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });

    // Obsługa wyszukiwania
    document.getElementById('search-input').addEventListener('input', handleSearch);
}

// Obsługa wyszukiwania
async function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    if (!query) {
        // Jeśli pole wyszukiwania jest puste, ukryj wyniki
        document.querySelector('.search-results').style.display = 'none';
        return;
    }

    try {
        // Pobierz wszystkich użytkowników
        const usersSnapshot = await db.collection('users').get();
        const users = [];

        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            // Sprawdź, czy użytkownik jest zalogowanym użytkownikiem
            if (userData.uid !== auth.currentUser.uid) {
                users.push({
                    id: doc.id,
                    ...userData
                });
            }
        });

        // Filtruj użytkowników
        const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );

        // Wyświetl wyniki
        displaySearchResults(filteredUsers);
    } catch (error) {
        console.error('Błąd podczas wyszukiwania:', error);
    }
}

// Wyświetlanie wyników wyszukiwania
function displaySearchResults(users) {
    const resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) {
        // Utwórz kontener wyników, jeśli nie istnieje
        const container = document.createElement('div');
        container.className = 'search-results';
        container.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-height: 400px;
            overflow-y: auto;
            margin-top: 10px;
            z-index: 1001;
        `;
        document.querySelector('.search-bar').appendChild(container);
    }

    // Przygotuj HTML wyników
    const html = users.map(user => `
        <div class="search-result-item">
            <img src="${user.avatar || 'images/default-avatar.png'}" class="search-result-avatar">
            <div class="search-result-info">
                <span class="search-result-name">${user.name}</span>
                <span class="search-result-email">${user.email}</span>
            </div>
            <button class="search-result-action" onclick="handleMatch('${user.id}')">
                <i class="material-icons">person_add</i>
            </button>
        </div>
    `).join('');

    resultsContainer.innerHTML = html;
    resultsContainer.style.display = users.length > 0 ? 'block' : 'none';
}

// Zamykanie modalów
function closeModal() {
    document.getElementById('post-modal').style.display = 'none';
    document.getElementById('search-modal').style.display = 'none';
}

// Obsługa przewijania
function handleScroll() {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
    
    loadMorePosts();
}

// Ładowanie więcej postów
async function loadMorePosts() {
    try {
        const lastPost = document.querySelector('.post:last-child');
        if (!lastPost) return;

        // Pobierz ID ostatniego posta
        const lastPostId = lastPost.querySelector('.like-btn').dataset.postId;
        
        // Pobierz kolejne posty
        const postsSnapshot = await db.collection('posts')
            .orderBy('createdAt', 'desc')
            .startAfter(lastPostId)
            .limit(10)
            .get();

        const postsContainer = document.getElementById('posts-container');
        postsSnapshot.forEach(doc => {
            const post = doc.data();
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Błąd podczas ładowania więcej postów:', error);
    }
}