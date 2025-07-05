// Funkcje pomocnicze
function formatDate(date) {
    return new Date(date).toLocaleString();
}

// Funkcja do obliczania wieku
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// Funkcja do ładowania profilu
async function loadUserProfile() {
    try {
        const user = auth.currentUser;
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Wczytaj zdjęcie profilowe
            const profileImage = document.getElementById('profile-image');
            if (profileImage) {
                profileImage.src = userData.avatar || 'images/av.png';
            }

            // Wczytaj nazwę użytkownika
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                profileName.textContent = userData.name;
            }

            // Wczytaj wiek
            if (userData.birthDate) {
                const age = calculateAge(userData.birthDate);
                const ageElement = document.getElementById('age');
                if (ageElement) {
                    ageElement.textContent = age;
                }
            }

            // Wczytaj statystyki
            const postsCount = document.getElementById('posts-count');
            if (postsCount) {
                postsCount.textContent = userData.posts || 0;
            }

            const followersCount = document.getElementById('followers-count');
            if (followersCount) {
                followersCount.textContent = userData.followers || 0;
            }

            const followingCount = document.getElementById('following-count');
            if (followingCount) {
                followingCount.textContent = userData.following || 0;
            }

            // Wczytaj bio
            const bioElement = document.getElementById('profile-bio').querySelector('p');
            if (bioElement) {
                bioElement.textContent = userData.bio || 'Brak opisu';
            }
        } else {
            console.error('Nie znaleziono dokumentu użytkownika');
        }
    } catch (error) {
        console.error('Błąd podczas ładowania profilu:', error);
    }
}

// Zmiana avataru
async function changeAvatar(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const user = auth.currentUser;
        if (!user) return;

        // Tworzenie unikalnej nazwy dla pliku
        const storageRef = storage.ref();
        const avatarRef = storageRef.child(`avatars/${user.uid}/${Date.now()}-${file.name}`);

        // Upload pliku
        const uploadTask = avatarRef.put(file);
        
        // Czekanie na zakończenie uploadu
        await uploadTask;
        
        // Pobieranie URL do pliku
        const downloadURL = await avatarRef.getDownloadURL();

        // Aktualizacja URL w bazie danych
        await db.collection('users').doc(user.uid).update({
            avatar: downloadURL
        });

        // Aktualizacja wyświetlanego avataru
        const profileAvatar = document.getElementById('profile-avatar');
        profileAvatar.src = downloadURL;

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
document.addEventListener('DOMContentLoaded', () => {
    // Obsługa zmiany avataru
    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', changeAvatar);
    }

    // Obsługa edycji profilu
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('edit-name').value;
            const bio = document.getElementById('edit-bio').value;
            await editProfile(name, bio);
        });
    }

    // Obsługa zapisywania postów
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('post-content').value;
            const image = document.getElementById('post-image').files[0];
            await savePost(content, image);
        });
    }

    // Obsługa zamykania modalu
    const closeModal = document.querySelector('.close');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            document.querySelector('.modal').style.display = 'none';
        });
    }

    // Obsługa kliknięcia poza modal
    window.addEventListener('click', (e) => {
        const modal = document.querySelector('.modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Sprawdź czy użytkownik jest zalogowany
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Załaduj dane profilu
        await loadUserProfile(user.uid);
    });
});
