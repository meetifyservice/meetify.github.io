document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const profilePosts = document.getElementById('profile-posts');
    const postsCount = document.getElementById('posts-count');
    const profileName = document.getElementById('profile-name');
    const profileBio = document.getElementById('profile-bio');
    const navLogo = document.querySelector('.nav-logo');

    // Dodaj event listener do logo
    if (navLogo) {
        navLogo.addEventListener('click', () => {
            window.location.href = 'app.html';
        });
    }

    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = "login.html";
            return;
        }

        // Pobierz ID użytkownika z URL
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');

        if (!userId) {
            window.location.href = "app.html";
            return;
        }

        // Załaduj dane użytkownika
        async function loadUserProfile(userId) {
            try {
                const userRef = db.collection('users').doc(userId);
                const userDoc = await userRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data();
                    profileName.textContent = userData.name;
                    profileBio.textContent = userData.bio || 'Brak opisu';
                    postsCount.textContent = userData.posts || 0;
                    
                    if (userData.avatar) {
                        document.getElementById('profile-avatar').src = userData.avatar;
                    }
                }
            } catch (error) {
                console.error('Błąd podczas ładowania danych użytkownika:', error);
            }
        }

        // Obsługa zmiany zdjęcia profilowego
        async function handleAvatarUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            try {
                // Generuj unikalną nazwę pliku
                const fileName = `avatars/${user.uid}_${Date.now()}_${file.name}`;
                
                // Upload pliku do Firebase Storage
                const storageRef = firebase.storage().ref(fileName);
                const uploadTask = storageRef.put(file);

                // Monitoruj postęp uploadu
                uploadTask.on('state_changed', 
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload progress:', progress);
                    },
                    (error) => {
                        console.error('Błąd podczas uploadu:', error);
                        alert('Wystąpił błąd podczas uploadu zdjęcia');
                    },
                    async () => {
                        // Po zakończeniu uploadu
                        const downloadURL = await storageRef.getDownloadURL();
                        
                        // Zapisz URL w bazie danych
                        const userRef = db.collection('users').doc(user.uid);
                        await userRef.update({
                            avatar: downloadURL,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });

                        // Aktualizuj wyświetlany avatar
                        document.getElementById('profile-avatar').src = downloadURL;
                        
                        // Zaktualizuj avatar w nav.js
                        const profileIcon = document.querySelector('.profile-icon');
                        if (profileIcon) {
                            profileIcon.style.backgroundImage = `url(${downloadURL})`;
                        }

                        alert('Zdjęcie profilowe zostało zmienione!');
                    }
                );
            } catch (error) {
                console.error('Błąd podczas zmiany zdjęcia profilowego:', error);
                alert('Wystąpił błąd podczas zmiany zdjęcia profilowego');
            }
        }

        // Ustaw event listener dla uploadu
        const avatarUpload = document.getElementById('avatar-upload');
        if (avatarUpload) {
            avatarUpload.addEventListener('change', handleAvatarUpload);
        }

        // Załaduj dane profilu użytkownika
        loadUserProfile(userId);

        // Załaduj posty użytkownika
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
                for (const doc of postsSnapshot.docs) {
                    const post = doc.data();
                    const userRef = db.collection('users').doc(post.userId);
                    const userDoc = await userRef.get();
                    const userData = userDoc.data();

                    post.authorName = userData.name;
                    post.authorAvatar = userData.avatar;

                    const postElement = createPostElement(post, doc.id);
                    profilePosts.appendChild(postElement);
                }
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
                        <img src="${post.authorAvatar || 'images/av.png'}" alt="Avatar" class="post-avatar">
                        <div class="post-author-info">
                            <h3>${post.authorName || 'Nieznany użytkownik'}</h3>
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

        loadPosts(userId);
    });
});
