document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Sprawdź, czy jesteśmy na stronie głównej
    if (window.location.pathname !== '/app.html') {
        return;
    }

    // Obsługa kliknięć na logo
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = 'app.html';
        });
    }

    // Dodaj ikonę powiadomień
    const notificationsIcon = document.createElement('div');
    notificationsIcon.className = 'notifications-icon';
    notificationsIcon.innerHTML = `
        <i class="material-icons">notifications</i>
    `;
    
    const notificationsContainer = document.createElement('div');
    notificationsContainer.className = 'notifications-container';
    notificationsContainer.style.display = 'none';
    
    document.body.appendChild(notificationsIcon);
    document.body.appendChild(notificationsContainer);

    // Obsługa kliknięć na ikonę powiadomień
    notificationsIcon.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return;

        const notifications = await loadNotifications(user.uid);
        showNotifications(notifications);
        
        // Oznacz powiadomienia jako przeczytane
        markNotificationsAsRead(user.uid);
    });

    // Obsługa kliknięć poza kontenerem powiadomień
    document.addEventListener('click', (e) => {
        if (!notificationsIcon.contains(e.target) && !notificationsContainer.contains(e.target)) {
            notificationsContainer.style.display = 'none';
        }
    });

    // Obsługa kliknięć na kółeczko profilowe
    const profileIcon = document.querySelector('.profile-icon');
    if (profileIcon) {
        profileIcon.addEventListener('click', () => {
            const auth = firebase.auth();
            if (auth.currentUser) {
                window.location.href = `profile.html?id=${auth.currentUser.uid}`;
            }
        });
    }

    // Aktualizacja liczby nieprzeczytanych powiadomień
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            const userData = await db.collection('users').doc(user.uid).get();
            if (userData.exists) {
                const unreadNotifications = userData.data().unreadNotifications || 0;
                if (unreadNotifications > 0) {
                    const notificationBadge = document.querySelector('.notification-badge');
                    if (!notificationBadge) {
                        const badge = document.createElement('div');
                        badge.className = 'notification-badge';
                        badge.textContent = unreadNotifications;
                        notificationsIcon.appendChild(badge);
                    } else {
                        notificationBadge.textContent = unreadNotifications;
                    }
                }
            }
        }
    });
});

// Funkcja do wyświetlania powiadomień
function showNotifications(notifications) {
    const notificationsContainer = document.querySelector('.notifications-container');
    
    notificationsContainer.innerHTML = `
        <div class="notifications-header">
            <h3>Powiadomienia</h3>
        </div>
        <div class="notifications-list">
            ${notifications.map(notification => `
                <div class="notification ${notification.read ? 'read' : ''}">
                    <div class="notification-content">
                        <span class="notification-type">${notification.type}</span>
                        <span class="notification-text">${notification.content}</span>
                        <span class="notification-time">${formatTime(notification.createdAt)}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    notificationsContainer.style.display = 'block';
}
