// Funkcje pomocnicze
function formatDate(date) {
    return new Date(date).toLocaleString();
}

// Funkcja do tworzenia elementu powiadomienia
function createNotificationElement(notification) {
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification ${notification.read ? 'read' : ''}`;
    notificationElement.innerHTML = `
        <div class="notification-content">
            <img src="${notification.senderAvatar}" alt="Avatar" class="notification-avatar">
            <div class="notification-info">
                <div class="notification-text">
                    <span class="notification-type">${notification.type}</span>
                    ${notification.message}
                </div>
                <span class="notification-time">${formatDate(notification.timestamp)}</span>
            </div>
        </div>
    `;
    return notificationElement;
}

// Funkcja do ładowania powiadomień
async function loadNotifications() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const notificationsRef = db.collection('notifications').where('userId', '==', user.uid);
        const querySnapshot = await notificationsRef.orderBy('timestamp', 'desc').limit(50).get();

        const notificationsList = document.querySelector('.notifications-list');
        notificationsList.innerHTML = '';

        querySnapshot.docs.forEach(doc => {
            const notification = doc.data();
            const notificationElement = createNotificationElement(notification);
            notificationsList.appendChild(notificationElement);
        });

        // Zaktualizuj licznik nieprzeczytanych powiadomień
        updateNotificationCount();
    } catch (error) {
        console.error('Błąd podczas ładowania powiadomień:', error);
    }
}

// Funkcja do aktualizacji licznika powiadomień
async function updateNotificationCount() {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const notificationsRef = db.collection('notifications')
            .where('userId', '==', user.uid)
            .where('read', '==', false);
        
        const querySnapshot = await notificationsRef.get();
        const count = querySnapshot.size;
        
        const notificationCountElement = document.getElementById('notifications-count');
        if (notificationCountElement) {
            notificationCountElement.textContent = count;
            notificationCountElement.style.display = count > 0 ? 'block' : 'none';
        }
    } catch (error) {
        console.error('Błąd podczas aktualizacji licznika powiadomień:', error);
    }
}

// Funkcja do oznaczania powiadomienia jako przeczytane
async function markAsRead(notificationId) {
    try {
        await db.collection('notifications').doc(notificationId).update({
            read: true,
            readAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Błąd podczas oznaczania powiadomienia jako przeczytane:', error);
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    // Ładowanie powiadomień
    loadNotifications();

    // Obsługa filtrów
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Usuń aktywność z poprzedniego przycisku
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            // Dodaj aktywność do nowego przycisku
            e.target.classList.add('active');
            
            // Zastosuj filtr
            const filter = e.target.dataset.filter;
            applyFilter(filter);
        });
    });

    // Funkcja do aplikowania filtru
    function applyFilter(filter) {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            if (filter === 'all' || notification.classList.contains(filter)) {
                notification.style.display = 'block';
            } else {
                notification.style.display = 'none';
            }
        });
    }

    // Sprawdź czy użytkownik jest zalogowany
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });

    // Nasłuchuj zmian w kolekcji powiadomień
    const user = auth.currentUser;
    if (user) {
        db.collection('notifications').where('userId', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .onSnapshot(snapshot => {
                loadNotifications();
            });
    }
});
