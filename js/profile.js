// Funkcje pomocnicze
function formatDate(date) {
    return new Date(date).toLocaleString();
}

// Ładowanie profilu użytkownika
async function loadUserProfile(userId) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Ustawienie danych profilu
            document.getElementById('profile-name').textContent = userData.name;
            document.getElementById('profile-bio').textContent = userData.bio;
            document.getElementById('posts-count').textContent = userData.posts;
            document.getElementById('followers-count').textContent = userData.followers;
            document.getElementById('following-count').textContent = userData.following;
            
            // Ustaw avatar
            const profileAvatar = document.getElementById('profile-avatar');
            profileAvatar.src = userData.avatar || 'images/av.png';
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
