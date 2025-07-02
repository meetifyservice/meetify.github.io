document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const profilePosts = document.getElementById('profile-posts');
    const postsCount = document.getElementById('posts-count');
    const profileName = document.getElementById('profile-name');
    const profileBio = document.getElementById('profile-bio');
    const userAvatar = document.getElementById('user-avatar');

    // Weryfikacja statusu logowania
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Załaduj dane profilu użytkownika
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                if (userData.avatar) {
                    userAvatar.src = userData.avatar;
                }
                if (userData.name) {
                    profileName.textContent = userData.name;
                }
                if (userData.bio) {
                    profileBio.textContent = userData.bio;
                }
            }
        });

        // Załaduj posty użytkownika
        loadPosts(user.uid);
    });

    // Funkcja do ładowania postów
    async function loadPosts(userId) {
        try {
            const postsSnapshot = await db.collection('posts')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            postsCount.textContent = postsSnapshot.size;
            
            if (postsSnapshot.empty) {
                profilePosts.innerHTML = '<div class="no-posts">Brak postów</div>';
                return;
            }

            profilePosts.innerHTML = '';
            postsSnapshot.forEach((doc) => {
                const post = doc.data();
                const postElement = createPostElement(post, doc.id);
                profilePosts.appendChild(postElement);
            });
        } catch (error) {
            console.error('Błąd podczas ładowania postów:', error);
            profilePosts.innerHTML = '<div class="error">Wystąpił błąd podczas ładowania postów</div>';
        }
    }

    // Funkcja do tworzenia elementu posta
    function createPostElement(post, postId) {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        
        // Formatowanie czasu
        const timeAgo = formatTimeAgo(post.createdAt);
        
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-author">
                    <img src="${userAvatar.src}" alt="Avatar" class="post-avatar">
                    <div class="post-author-info">
                        <h3>${profileName.textContent}</h3>
                        <span class="post-time">${timeAgo}</span>
                    </div>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
            </div>
            ${post.imageUrl ? `
            <div class="post-image">
                <img src="${post.imageUrl}" alt="Zdjęcie posta">
            </div>` : ''}
            <div class="post-actions">
                <button class="like-btn">
                    <span class="material-icons">favorite_border</span>
                    <span class="like-count">${post.likes || 0}</span>
                </button>
            </div>
        `;

        return postElement;
    }

    // Funkcja do formatowania czasu "x czas temu"
    function formatTimeAgo(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };

        for (const [key, secondsInInterval] of Object.entries(intervals)) {
            const count = Math.floor(seconds / secondsInInterval);
            if (count >= 1) {
                return `${count} ${key}${count > 1 ? 'y' : ''} temu`;
            }
        }
        return 'teraz';
    }
});
