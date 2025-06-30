// Inicjalizacja
document.addEventListener('DOMContentLoaded', function() {
    // Elementy DOM
    const registerForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const showLoginBtn = document.getElementById('show-login');
    const showRegisterBtn = document.getElementById('show-register');
    
    // Przełączanie formularzy
    function switchForm(showId, hideId) {
        document.getElementById(hideId).classList.remove('active');
        document.getElementById(showId).classList.add('active');
        resetForms();
    }
    
    // Reset formularzy
    function resetForms() {
        registerForm.reset();
        loginForm.reset();
        hideErrorMessages();
    }
    
    // Ukrywanie komunikatów błędów
    function hideErrorMessages() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    // Pokazywanie błędu
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorMsg = input.nextElementSibling;
        
        if (errorMsg && errorMsg.classList.contains('error-message')) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
            input.style.borderColor = '#e74c3c';
        }
    }
    
    // Walidacja wieku
    function validateAge(year, month, day) {
        const birthDate = new Date(year, month - 1, day);
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 13);
        return birthDate <= minDate;
    }
    
    // Sprawdzanie czy to email
    function isEmail(input) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    }
    
    // Event listeners
    showLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        switchForm('login-form', 'register-form');
    });
    
    showRegisterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        switchForm('register-form', 'login-form');
    });
    
    // Obsługa rejestracji
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        hideErrorMessages();
        
        // Pobieranie wartości
        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const day = document.getElementById('birth-day').value;
        const month = document.getElementById('birth-month').value;
        const year = document.getElementById('birth-year').value;
        const gender = document.getElementById('gender').value;
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        
        // Walidacja
        let isValid = true;
        
        if (!firstName) {
            showError('first-name', 'Proszę podać imię');
            isValid = false;
        }
        
        if (!lastName) {
            showError('last-name', 'Proszę podać nazwisko');
            isValid = false;
        }
        
        if (!day || !month || !year) {
            showError('birth-day', 'Proszę podać pełną datę urodzenia');
            isValid = false;
        } else if (!validateAge(year, month, day)) {
            showError('birth-day', 'Musisz mieć co najmniej 13 lat');
            isValid = false;
        }
        
        if (!gender) {
            showError('gender', 'Proszę wybrać płeć');
            isValid = false;
        }
        
        if (!email) {
            showError('register-email', 'Proszę podać email');
            isValid = false;
        } else if (!isEmail(email)) {
            showError('register-email', 'Nieprawidłowy adres email');
            isValid = false;
        }
        
        if (!password) {
            showError('register-password', 'Proszę podać hasło');
            isValid = false;
        } else if (password.length < 6) {
            showError('register-password', 'Hasło musi mieć co najmniej 6 znaków');
            isValid = false;
        }
        
        if (isValid) {
            console.log('Rejestracja:', {
                firstName,
                lastName,
                birthDate: `${day}/${month}/${year}`,
                gender,
                email,
                password
            });
            
            // Tutaj dodasz Firebase Auth
            alert('Rejestracja przebiegła pomyślnie!');
        }
    });
    
    // Obsługa logowania
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        hideErrorMessages();
        
        const identifier = document.getElementById('login-identifier').value.trim();
        const password = document.getElementById('login-password').value;
        
        let isValid = true;
        
        if (!identifier) {
            showError('login-identifier', 'Proszę podać email lub nazwę użytkownika');
            isValid = false;
        }
        
        if (!password) {
            showError('login-password', 'Proszę podać hasło');
            isValid = false;
        }
        
        if (isValid) {
            console.log('Logowanie:', { identifier, password });
            
            // Tutaj dodasz Firebase Auth
            // window.location.href = 'app.html';
        }
    });
    
    // Inicjalizacja - pokaż formularz rejestracji
    document.getElementById('register-form').classList.add('active');
});