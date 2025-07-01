document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const userAvatar = document.getElementById('user-avatar');

    // Ustawienie stylów dla kontenera wyników
    searchResults.style.cssText = `
        max-width: 1200px;
        margin: 20px auto;
        padding: 0 20px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    `;

    // Weryfikacja statusu logowania
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Załaduj avatar użytkownika
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (!doc.exists) {
                console.error('Nie znaleziono profilu użytkownika');
                return;
            }
            
            const userData = doc.data();
            if (userData.avatar) {
                userAvatar.src = userData.avatar;
            }
        }).catch(error => {
            console.error('Błąd podczas ładowania profilu:', error);
        });
    });

    // Obsługa wyszukiwania
    searchInput.addEventListener('input', async (e) => {
        if (!auth.currentUser) {
            alert('Musisz być zalogowany, aby wyszukiwać użytkowników');
            return;
        }

        const query = e.target.value.trim().toLowerCase();
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }

        try {
            searchResults.innerHTML = '<div class="loading">Wyszukiwanie...</div>';
            
            const usersSnapshot = await db.collection('users')
                .get();

            if (!usersSnapshot) {
                console.error('Nie udało się pobrać użytkowników');
                searchResults.innerHTML = '<div class="error">Nie udało się załadować użytkowników</div>';
                return;
            }

            const filteredUsers = [];
            usersSnapshot.forEach((doc) => {
                const user = doc.data();
                if (!user) return;
                
                // Sprawdź, czy użytkownik nie jest bieżącym użytkownikiem
                if (user.uid === auth.currentUser.uid) return;

                // Sprawdź, czy użytkownik ma wymagane pola
                if (!user.name || !user.email) return;

                // Sprawdź, czy tekst wyszukania pasuje do nazwy lub emaila
                if (user.name.toLowerCase().includes(query) || 
                    user.email.toLowerCase().includes(query)) {
                    filteredUsers.push({
                        ...user,
                        id: doc.id
                    });
                }
            });

            if (filteredUsers.length === 0) {
                searchResults.innerHTML = '<div class="no-results">Brak wyników wyszukiwania</div>';
                return;
            }

            searchResults.innerHTML = '';
            filteredUsers.forEach(user => {
                const result = document.createElement('div');
                result.className = 'search-result';
                result.innerHTML = `
                    <img src="${user.avatar || 'images/av.png'}" alt="${user.name}" class="search-avatar">
                    <div class="search-info">
                        <h3>${user.name}</h3>
                        <p>${user.email}</p>
                    </div>
                    <button class="match-btn" onclick="matchUser('${user.id}')">Match</button>
                `;
                searchResults.appendChild(result);
            });
        } catch (error) {
            console.error('Błąd podczas wyszukiwania:', error);
            searchResults.innerHTML = '<div class="error">Wystąpił błąd podczas wyszukiwania</div>';
        }
    });

    // Obsługa matchowania
    window.matchUser = async (userId) => {
        try {
            if (!auth.currentUser) {
                alert('Musisz być zalogowany, aby wysłać match');
                return;
            }

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
        } catch (error) {
            console.error('Błąd podczas matchowania:', error);
            alert('Wystąpił błąd podczas wysyłania matcha.');
        }
    };
});
