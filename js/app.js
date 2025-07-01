// Sprawdź stan logowania
firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        console.log("Zalogowany użytkownik:", user.uid);
    }
});

// Obsługa przycisku ustawień
document.querySelector('.settings-btn')?.addEventListener('click', () => {
    alert("Menu ustawień będzie dostępne wkrótce!");
});