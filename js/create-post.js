document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();
    const postContent = document.getElementById('post-content');
    const postImage = document.getElementById('post-image');
    const previewImage = document.getElementById('preview-image');
    const publishBtn = document.getElementById('publish-btn');
    const userAvatar = document.getElementById('user-avatar');

    // Weryfikacja statusu logowania
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Załaduj avatar użytkownika
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                if (userData.avatar) {
                    userAvatar.src = userData.avatar;
                }
            }
        });
    });

    // Podgląd zdjęcia
    postImage.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Publikowanie posta
    publishBtn.addEventListener('click', async () => {
        const content = postContent.value.trim();
        const file = postImage.files[0];

        if (!content && !file) {
            alert('Post musi zawierać tekst lub zdjęcie!');
            return;
        }

        try {
            const postRef = db.collection('posts').doc();
            const postId = postRef.id;
            const userId = auth.currentUser.uid;

            // Zapisz post do Firestore
            await postRef.set({
                userId,
                content,
                likes: 0,
                comments: [],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Jeśli użytkownik dodał zdjęcie, przekaż je do Firebase Storage
            if (file) {
                const storageRef = storage.ref(`posts/${postId}/${file.name}`);
                await storageRef.put(file);
                const imageUrl = await storageRef.getDownloadURL();
                await postRef.update({ imageUrl });
            }

            // Zaktualizuj licznik postów w profilu użytkownika
            await db.collection('users').doc(userId).update({
                postsCount: firebase.firestore.FieldValue.increment(1)
            });

            alert('Post został opublikowany!');
            window.location.href = 'app.html';
        } catch (error) {
            console.error('Błąd podczas publikowania posta:', error);
            alert('Wystąpił błąd podczas publikowania posta.');
        }
    });
});
