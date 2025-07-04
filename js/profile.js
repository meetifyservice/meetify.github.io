document.addEventListener('DOMContentLoaded', async () => {
    // Sprawdź połączenie z bazą danych
    firebase.firestore().settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    
    firebase.firestore().enablePersistence()
        .catch(err => {
            console.log('Persistence failed: ' + err);
        });

    firebase.firestore().collection('users').doc('test-connection')
        .set({
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log('Połączenie z bazą danych działa');
        })
        .catch(err => {
            console.error('Błąd połączenia z bazą danych:', err);
        });

    // Inicjalizacja Firebase
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Sprawdź połączenie z bazą danych
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
    
    db.enablePersistence()
        .catch(err => {
            console.log('Persistence failed: ' + err);
        });

    db.collection('users').doc('test-connection')
        .set({
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log('Połączenie z bazą danych działa');
        })
        .catch(err => {
            console.error('Błąd połączenia z bazą danych:', err);
        });

    // Debugowanie danych
    async function debugUserData(userId) {
        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                console.log('Dane użytkownika:', {
                    id: userId,
                    name: userData.name,
                    email: userData.email,
                    avatar: userData.avatar
                });
            } else {
                console.log('Brak danych użytkownika:', userId);
            }
        } catch (error) {
            console.error('Błąd podczas debugowania:', error);
        }
    }

    async function debugPosts() {
        try {
            const postsSnapshot = await db.collection('posts')
                .orderBy('createdAt', 'desc')
                .limit(5)
                .get();

            console.log('Debug postów:', postsSnapshot.docs.map(doc => ({
                id: doc.id,
                data: doc.data()
            })));
        } catch (error) {
            console.error('Błąd podczas debugowania postów:', error);
        }
    }

    // Uruchom debugowanie
    const currentUser = auth.currentUser;
    if (currentUser) {
        debugUserData(currentUser.uid);
        debugPosts();
    }
    const profilePosts = document.getElementById('profile-posts');
    const postsCount = document.getElementById('posts-count');
    const profileName = document.getElementById('profile-name');
    const profileBio = document.getElementById('profile-bio');
    const navLogo = document.querySelector('.nav-logo');
    const editBtn = document.querySelector('.edit-profile-btn');
    const modal = document.getElementById('edit-profile-modal');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    const form = document.getElementById('edit-profile-form');

    // Sprawdź czy wszystkie elementy są obecne
    if (!profilePosts || !postsCount || !profileName || !profileBio || !navLogo || !editBtn || !modal || !closeBtn || !form) {
        console.error('Brak wymaganych elementów w DOM');
        return;
    }

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
                    // Usuń wyświetlanie emaila
                    const profileEmail = document.getElementById('profile-email');
                    if (profileEmail) {
                        profileEmail.style.display = 'none';
                    }
                    
                    // Ustaw avatar
                    const profileAvatar = document.getElementById('profile-avatar');
                    const userAvatar = document.getElementById('user-avatar');
                    
                    if (userData.avatar) {
                        profileAvatar.src = userData.avatar;
                        userAvatar.src = userData.avatar;
                    } else {
                        profileAvatar.src = 'images/default-avatar.png';
                        userAvatar.src = 'images/default-avatar.png';
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

        // Inicjalizacja modalu
        if (editBtn) {
            editBtn.addEventListener('click', async () => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                    return;
                }
                modal.style.display = 'block';
                try {
                    const userDoc = await db.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        const data = userDoc.data();
                        form.elements['name'].value = data.name || '';
                        form.elements['bio'].value = data.bio || '';
                    }
                } catch (error) {
                    console.error('Błąd podczas ładowania danych profilu:', error);
                    alert('Wystąpił błąd podczas ładowania danych profilu');
                    modal.style.display = 'none';
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Obsługa formularza edycji
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = form.elements['name'].value.trim();
                const bio = form.elements['bio'].value.trim();

                if (!name) {
                    alert('Imię jest wymagane');
                    return;
                }

                try {
                    await db.collection('users').doc(userId).update({
                        name,
                        bio,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    // Zaktualizuj wyświetlone dane
                    profileName.textContent = name;
                    profileBio.textContent = bio;

                    alert('Profil został zaktualizowany!');
                    modal.style.display = 'none';
                } catch (error) {
                    console.error('Błąd podczas edycji profilu:', error);
                    alert('Wystąpił błąd podczas edycji profilu');
                }
            });
        }
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                document.getElementById('edit-profile-modal').style.display = 'block';
            });
        }

        // Dodaj event listener do przycisku zamknięcia
        const closeBtn = document.querySelector('.modal .close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                document.getElementById('edit-profile-modal').style.display = 'none';
            });
    }

        // Funkcja do formatowania czasu "x czas temu"
        function formatTimeAgo(date) {
            if (typeof date === 'string') {
                date = new Date(date);
            }
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
