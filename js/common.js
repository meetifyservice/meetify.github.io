// Wspólne funkcje dla wszystkich stron

// Inicjalizacja przycisków banera
function initializeNavbarButtons() {
    // Przyciski banera
    const notificationsBtn = document.getElementById('notifications-btn');
    const messagesBtn = document.getElementById('messages-btn');
    const profileBtn = document.getElementById('profile-btn');

    // Funkcja do bezpiecznego przekierowania
    function safeRedirect(url) {
        auth.onAuthStateChanged(user => {
            if (user) {
                window.location.href = url;
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    // Obsługa przycisku powiadomień
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            safeRedirect('notifications.html');
        });
    }

    // Obsługa przycisku wiadomości
    if (messagesBtn) {
        messagesBtn.addEventListener('click', () => {
            safeRedirect('messages.html');
        });
    }

    // Obsługa przycisku profilu
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            safeRedirect('profile.html');
        });
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    initializeNavbarButtons();
});
