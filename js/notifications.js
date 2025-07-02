const notificationsRef = db.collection('notifications');
const favoritesRef = db.collection('favorites');

// Funkcja do wysyłania powiadomienia
async function sendNotification(userId, type, content, postId = null) {
    try {
        await notificationsRef.add({
            userId,
            type,
            content,
            postId,
            read: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Aktualizacja liczby nieprzeczytanych powiadomień
        await db.collection('users').doc(userId).update({
            unreadNotifications: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Błąd podczas wysyłania powiadomienia:', error);
    }
}

// Funkcja do oznaczania powiadomień jako przeczytane
async function markNotificationsAsRead(userId) {
    try {
        const notifications = await notificationsRef
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        const batch = db.batch();
        notifications.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();
        
        // Zresetuj licznik nieprzeczytanych powiadomień
        await db.collection('users').doc(userId).update({
            unreadNotifications: 0
        });
    } catch (error) {
        console.error('Błąd podczas oznaczania powiadomień jako przeczytane:', error);
    }
}

// Funkcja do dodawania posta do ulubionych
async function toggleFavorite(postId) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const favoritesSnapshot = await favoritesRef
            .where('userId', '==', user.uid)
            .where('postId', '==', postId)
            .get();

        if (favoritesSnapshot.empty) {
            // Dodaj do ulubionych
            await favoritesRef.add({
                userId: user.uid,
                postId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Zaktualizuj licznik ulubionych w postcie
            await db.collection('posts').doc(postId).update({
                favoritesCount: firebase.firestore.FieldValue.increment(1)
            });

            // Wyślij powiadomienie
            const post = await db.collection('posts').doc(postId).get();
            if (post.exists) {
                const postAuthor = await db.collection('users').doc(post.data().authorId).get();
                if (postAuthor.exists) {
                    sendNotification(post.data().authorId, 'favorite', `${user.displayName} dodał Twój post do ulubionych`, postId);
                }
            }
        } else {
            // Usuń z ulubionych
            favoritesSnapshot.docs[0].ref.delete();
            
            // Zaktualizuj licznik ulubionych w postcie
            await db.collection('posts').doc(postId).update({
                favoritesCount: firebase.firestore.FieldValue.increment(-1)
            });
        }
    } catch (error) {
        console.error('Błąd podczas dodawania/usuwania posta z ulubionych:', error);
    }
}

// Funkcja do pobierania powiadomień
async function loadNotifications(userId) {
    try {
        const notificationsSnapshot = await notificationsRef
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();

        const notifications = notificationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return notifications;
    } catch (error) {
        console.error('Błąd podczas pobierania powiadomień:', error);
        return [];
    }
}
