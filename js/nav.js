document.addEventListener('DOMContentLoaded', () => {
    // Dodajemy funkcjonalność klikania w logo
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.location.href = 'app.html';
        });
    }
});
