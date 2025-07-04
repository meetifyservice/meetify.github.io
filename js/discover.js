document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const matchesContainer = document.getElementById('matches-container');
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

        // Załaduj potencjalne matche
        loadPotentialMatches();
    });

    // Załaduj potencjalne matche
    async function loadPotentialMatches() {
        try {
            // Pobierz wszystkich użytkowników oprócz bieżącego
            const usersSnapshot = await db.collection('users')
                .where('uid', '!=', auth.currentUser.uid)
                .limit(10)
                .orderBy('createdAt', 'desc')
                .get();

            // Sprawdź czy mamy więcej użytkowników do pokazania
            const lastVisible = usersSnapshot.docs[usersSnapshot.docs.length - 1];
            if (lastVisible) {
                document.getElementById('load-more').style.display = 'block';
            } else {
                document.getElementById('load-more').style.display = 'none';
            }

            matchesContainer.innerHTML = '';
            usersSnapshot.forEach((doc) => {
                const user = doc.data();
                const matchCard = document.createElement('div');
                matchCard.className = 'match-card';
                matchCard.innerHTML = `
                    <img src="${user.avatar || 'images/av.png'}" alt="${user.displayName}" class="match-avatar">
                    <div class="match-info">
                        <h3>${user.displayName}</h3>
                        <p>${user.bio || 'Brak opisu'}</p>
                    </div>
                    <div class="match-actions">
                        <button class="btn match-btn" onclick="matchUser('${user.uid}')">Match</button>
                        <button class="btn skip-btn" onclick="skipUser('${user.uid}')">Pomiń</button>
                    </div>
                `;
                matchesContainer.appendChild(matchCard);
            });
        } catch (error) {
            console.error('Błąd podczas ładowania potencjalnych matchów:', error);
        }
    }

    // Obsługa matchowania
    window.matchUser = async (userId) => {
        try {
            const matchRef = db.collection('matches').doc();
            await matchRef.set({
                userId1: auth.currentUser.uid,
                userId2: userId,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Zaktualizuj status matchowania w profilach użytkowników
            await Promise.all([
                db.collection('users').doc(auth.currentUser.uid).update({
                    matches: firebase.firestore.FieldValue.arrayUnion(userId)
                }),
                db.collection('users').doc(userId).update({
                    matches: firebase.firestore.FieldValue.arrayUnion(auth.currentUser.uid)
                })
            ]);

            alert('Match wysłany! Oczekuj na odpowiedź.');
            loadPotentialMatches();
        } catch (error) {
            console.error('Błąd podczas matchowania:', error);
            alert('Wystąpił błąd podczas wysyłania matcha.');
        }
    };

    // Obsługa pomijania użytkownika
    window.skipUser = async (userId) => {
        try {
            // Zaktualizuj listę pominiętych użytkowników
            await db.collection('users').doc(auth.currentUser.uid).update({
                skippedUsers: firebase.firestore.FieldValue.arrayUnion(userId)
            });

            loadPotentialMatches();
        } catch (error) {
            console.error('Błąd podczas pomijania użytkownika:', error);
        }
    };
});
