document.addEventListener('DOMContentLoaded', () => {
    // Obsługa kliknięć na logo
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = 'app.html';
        });
    }

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
});
