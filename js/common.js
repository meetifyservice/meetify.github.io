// Wspólne funkcje dla wszystkich stron

// Inicjalizacja przycisków banera
function initializeNavbarButtons() {
    // Funkcja do bezpiecznego przekierowania
    function safeRedirect(url) {
        // Sprawdź, czy jesteśmy już na stronie login
        if (window.location.pathname === '/login.html') {
            return;
        }

        // Sprawdź, czy Firebase jest zainicjalizowane
        if (!window.auth) {
            console.error('Firebase nie jest zainicjalizowane');
            return;
        }

        // Sprawdź stan autentykacji
        const user = window.auth.currentUser;
        
        if (user) {
            // Jeśli użytkownik jest zalogowany i próbuje wejść na login, przekieruj go na index
            if (window.location.pathname === '/login.html') {
                window.location.href = 'index.html';
                return;
            }
            
            // Jeśli użytkownik jest zalogowany, przejdź do wybranej strony
            window.location.href = url;
        } else {
            // Jeśli użytkownik nie jest zalogowany, przejdź do login
            window.location.href = 'login.html';
        }
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
