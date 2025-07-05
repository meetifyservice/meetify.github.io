// Wspólne funkcje dla wszystkich stron

// Inicjalizacja przycisków banera
function initializeNavbarButtons() {
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

    // Inicjalizacja przycisków
    const buttons = document.querySelectorAll('.nav-button');
    buttons.forEach(button => {
        const id = button.id;
        const urls = {
            'notifications-btn': 'notifications.html',
            'messages-btn': 'messages.html',
            'profile-btn': 'profile.html'
        };
        
        if (urls[id]) {
            button.addEventListener('click', () => {
                safeRedirect(urls[id]);
            });
        }
    });
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    initializeNavbarButtons();
});
