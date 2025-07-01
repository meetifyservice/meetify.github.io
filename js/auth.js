// Usunąłem wszystkie funkcje przełączające formularze
// Teraz logika tylko do wysyłania formularzy

document.getElementById('registration-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Rejestracja wysłana");
    // Tutaj dodaj logikę Firebase
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("Logowanie wysłane");
    // Tutaj dodaj logikę Firebase
});