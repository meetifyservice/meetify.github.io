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
                // Użyj domyślnego av.png jeśli użytkownik nie ma swojego zdjęcia
                const avatarUrl = userData.avatar ? userData.avatar : 'images/av.png';
                profileImage.src = avatarUrl;
                console.log('Ustawiono zdjęcie profilowe:', avatarUrl);
            }

            // Wczytaj nazwę użytkownika i username
            const profileName = document.getElementById('profile-name');
            if (profileName) {
                // Utwórz pełną nazwę: "Imię Nazwisko, wiek"
                const fullName = `${userData.firstName} ${userData.lastName}`;
                const age = calculateAge(userData.birthDate);
                const fullNameWithAge = `${fullName}, ${age}`;
                
                // Ustaw pełną nazwę
                profileName.textContent = fullNameWithAge;
                console.log('Ustawiono pełną nazwę:', fullNameWithAge);
            }

            // Ustaw username w przygotowanym elemencie
            const usernameElement = document.getElementById('profile-username');
            if (usernameElement) {
                usernameElement.textContent = `@${userData.username}`;
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

// Funkcje modalu edycji profilu
window.openModal = function() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

window.closeModal = function() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
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
            closeModal();
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
document.addEventListener('DOMContentLoaded', () => {
    // Dodanie event listenerów
    const editProfileBtn = document.getElementById('edit-profile-btn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', openModal);
    }

    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.saveProfileChanges();
        });
    }

    const avatarInput = document.getElementById('edit-avatar');
    if (avatarInput) {
        avatarInput.addEventListener('change', (e) => {
            window.changeAvatar(e);
        });
    }

    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.saveProfileChanges();
        });
    }

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
