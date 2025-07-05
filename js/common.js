// Wspólne funkcje dla wszystkich stron

// Inicjalizacja przycisków banera
function initializeNavbarButtons() {
    // Przyciski banera
    const notificationsBtn = document.getElementById('notifications-btn');
    const messagesBtn = document.getElementById('messages-btn');
    const profileBtn = document.getElementById('profile-btn');

    // Obsługa przycisku powiadomień
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => {
            window.location.href = 'notifications.html';
        });
    }

    // Obsługa przycisku wiadomości
    if (messagesBtn) {
        messagesBtn.addEventListener('click', () => {
            window.location.href = 'messages.html';
        });
    }

    // Obsługa przycisku profilu
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    initializeNavbarButtons();
});
