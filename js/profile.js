// Upewnij się, że korzystasz z globalnych auth/db
console.log('profile.js: window.auth:', window.auth, 'window.db:', window.db);

// Funkcje pomocnicze
function formatDate(date) {
    return new Date(date).toLocaleString();
}

// Funkcja do obliczania wieku
function calculateAge(birthDate) {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Funkcje modalu edycji profilu
window.modal = {
    open: function() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } else {
            console.error('Nie znaleziono modalu edycji profilu');
        }
    },
    close: function() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        } else {
            console.error('Nie znaleziono modalu edycji profilu');
        }
    }
};

// Funkcja do ładowania profilu
async function loadUserProfile(userIdFromParam) {
    try {
        let uid = userIdFromParam;
        if (!uid) {
            const user = auth.currentUser;
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            uid = user.uid;
        }
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Rozróżnij własny profil vs cudzy
            const currentUser = auth.currentUser;
            const isOwnProfile = !userIdFromParam || (currentUser && currentUser.uid === userIdFromParam);
            const profileActions = document.querySelector('.profile-actions');
            const editProfileBtn = document.getElementById('edit-profile-btn');
            if (isOwnProfile) {
                if (profileActions) profileActions.style.display = 'none';
                if (editProfileBtn) editProfileBtn.style.display = '';
            } else {
                if (profileActions) profileActions.style.display = 'flex';
                if (editProfileBtn) editProfileBtn.style.display = 'none';
                // Obsługa kliknięć akcji
                const addFriendBtn = document.getElementById('add-friend-btn');
                if (addFriendBtn) {
                    addFriendBtn.onclick = () => addFriend(userIdFromParam);
                }
                const sendMessageBtn = document.getElementById('send-message-btn');
                if (sendMessageBtn) {
                    sendMessageBtn.onclick = () => sendMessage(userIdFromParam);
                }
            }
            
            // Wczytaj zdjęcie profilowe
            const profileImage = document.getElementById('profile-image');
            if (profileImage) {
                // Użyj domyślnego av.png jeśli użytkownik nie ma swojego zdjęcia
                const avatarUrl = userData.avatar ? userData.avatar : 'images/av.png';
                profileImage.src = avatarUrl;
                console.log('Ustawiono zdjęcie profilowe:', avatarUrl);
            }

            // Wczytaj nazwę użytkownika i username
const profileNameAge = document.getElementById('profile-name-age');
if (profileNameAge) {
    const fullName = `${userData.firstName} ${userData.lastName}`;
    const age = calculateAge(userData.birthDate);
    profileNameAge.textContent = `${fullName}, ${age}`;
    console.log('Ustawiono imię, nazwisko i wiek:', profileNameAge.textContent);
}

            // Wczytaj statystyki
            const postsCount = document.getElementById('posts-count');
            if (postsCount) {
                postsCount.textContent = userData.posts || 0;
                console.log('Ustawiono liczbę postów:', userData.posts || 0);
            }

            const followersCount = document.getElementById('followers-count');
            if (followersCount) {
                followersCount.textContent = userData.followers || 0;
                console.log('Ustawiono liczbę obserwujących:', userData.followers || 0);
            }

            const followingCount = document.getElementById('following-count');
            if (followingCount) {
                followingCount.textContent = userData.following || 0;
                console.log('Ustawiono liczbę obserwowanych:', userData.following || 0);
            }

            // Wczytaj bio
            const bioElement = document.getElementById('profile-bio').querySelector('p');
            if (bioElement) {
                bioElement.textContent = userData.bio || 'Brak opisu';
                console.log('Ustawiono bio:', userData.bio || 'Brak opisu');
            }

            // Wypełnij formularz edycji profilu
            const editBio = document.getElementById('edit-bio');
            if (editBio) editBio.value = userData.bio;

            // Ustaw podgląd zdjęcia
            const previewImage = document.getElementById('preview-image');
            if (previewImage) {
                previewImage.src = userData.avatar || 'images/av.png';
            }
        } else {
            console.error('Nie znaleziono dokumentu użytkownika');
        }
    } catch (error) {
        console.error('Błąd podczas ładowania profilu:', error);
    }
}

// Zapisz zmiany profilu
window.saveProfileChanges = async function() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const editBio = document.getElementById('edit-bio');
        if (editBio) {
            await db.collection('users').doc(user.uid).update({
                bio: editBio.value
            });

            // Zaktualizuj wyświetlane dane
            const bioElement = document.getElementById('profile-bio').querySelector('p');
            if (bioElement) {
                bioElement.textContent = editBio.value;
            }

            // Zamknij modal
            window.modal.close();
        }
    } catch (error) {
        console.error('Błąd podczas zapisywania zmian profilu:', error);
    }
}

// Usuń podgląd zdjęcia
function clearPreview() {
    const previewImage = document.getElementById('preview-image');
    if (previewImage) {
        previewImage.src = '';
    }
    const fileInput = document.getElementById('edit-avatar');
    if (fileInput) {
        fileInput.value = '';
    }
}

// Zmiana avataru
window.changeAvatar = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const user = auth.currentUser;
        if (!user) return;

        // Zaktualizuj podgląd zdjęcia
        const previewImage = document.getElementById('preview-image');
        if (previewImage) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        // Zapisz zdjęcie do Firebase Storage
        const storageRef = storage.ref();
        const avatarRef = storageRef.child(`avatars/${user.uid}`);
        await avatarRef.put(file);

        // Pobierz URL zdjęcia
        const url = await avatarRef.getDownloadURL();
        
        // Zaktualizuj dane użytkownika
        await db.collection('users').doc(user.uid).update({
            avatar: url
        });

        // Zaktualizuj zdjęcie profilowe
        const profileImage = document.getElementById('profile-image');
        if (profileImage) {
            profileImage.src = url;
        }

        // Zaktualizuj podgląd w modalu
        if (previewImage) {
            previewImage.src = url;
        }

        // Zapisz URL zdjęcia w localStorage na wypadek odświeżenia strony
        localStorage.setItem('userAvatar', url);

    } catch (error) {
        console.error('Błąd podczas zmiany avataru:', error);
    }
}

// Edycja profilu
async function editProfile(name, bio) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        await db.collection('users').doc(user.uid).update({
            name,
            bio,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Aktualizacja wyświetlanego profilu
        await loadUserProfile(user.uid);
    } catch (error) {
        console.error('Błąd podczas edycji profilu:', error);
    }
}

// Obsługa zapisywania postów
async function savePost(content, image) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const postData = {
            content,
            image,
            userId: user.uid,
            userName: user.displayName || 'Użytkownik',
            userAvatar: user.photoURL || 'images/default-avatar.png',
            likes: 0,
            comments: 0,
            shares: 0,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('posts').add(postData);

        // Zaktualizuj licznik postów użytkownika
        await db.collection('users').doc(user.uid).update({
            posts: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Błąd podczas zapisywania posta:', error);
    }
}

// Inicjalizacja po załadowaniu strony
window.addEventListener('DOMContentLoaded', () => {
    // Obsługa nawigacji do wiadomości i powiadomień
    const messagesBtn = document.getElementById('messages-btn');
    if (messagesBtn) {
        messagesBtn.addEventListener('click', () => {
            window.location.href = 'messages.html';
        });
    }
    const notificationsBtn = document.getElementById('notifications-btn');
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            window.location.href = 'notifications.html';
        });
    }
    console.log('Strona załadowana, inicjalizacja event listenerów');
    
    // Czekaj na zainicjalizowanie Firebase
    window.addEventListener('firebase-initialized', () => {
        // Przycisk edycji profilu
        const editProfileBtn = document.getElementById('edit-profile-btn');
        if (editProfileBtn) {
            console.log('Dodawanie event listenera dla przycisku edycji profilu');
            editProfileBtn.addEventListener('click', window.modal.open);
        } else {
            console.error('Nie znaleziono przycisku edycji profilu');
        }

        // Zamykanie modalu
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            console.log('Dodawanie event listenera dla przycisku zamknięcia modalu');
            closeBtn.addEventListener('click', window.modal.close);
        } else {
            console.error('Nie znaleziono przycisku zamknięcia modalu');
        }

        // Formularz edycji profilu
        const editForm = document.getElementById('edit-profile-form');
        if (editForm) {
            console.log('Dodawanie event listenera dla formularza edycji profilu');
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                window.saveProfileChanges();
            });
        }

        // Obsługa kliknięcia poza modal
        window.addEventListener('click', (e) => {
            const modal = document.querySelector('.modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Zamiast pojedynczego sprawdzenia, nasłuchuj eventu firebase-initialized
        window.addEventListener('firebase-initialized', () => {
            if (window.auth && typeof window.auth.onAuthStateChanged === 'function') {
                window.auth.onAuthStateChanged(async (user) => {
                    if (!user) {
                        window.location.href = 'login.html';
                        return;
                    }
                    // Pobierz userId z URL jeśli jest
                    const urlParams = new URLSearchParams(window.location.search);
                    const userId = urlParams.get('userId');
                    await loadUserProfile(userId);
                });
            }
        });
    });
});
