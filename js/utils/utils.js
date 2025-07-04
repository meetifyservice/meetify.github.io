// Funkcje pomocnicze

// Formatowanie daty
export function formatDate(date) {
    return new Date(date).toLocaleString();
}

// Generowanie unikalnego ID
export function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Walidacja email
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Walidacja hasła
export function validatePassword(password) {
    // Hasło musi mieć co najmniej 6 znaków
    return password.length >= 6;
}

// Funkcja do ładowania elementu
export function showLoading(element) {
    element.style.display = 'block';
}

// Funkcja do ukrywania elementu
export function hideLoading(element) {
    element.style.display = 'none';
}

// Funkcja do wyświetlenia komunikatu
export function showMessage(message, type = 'success') {
    const messageContainer = document.createElement('div');
    messageContainer.className = `message ${type}`;
    messageContainer.textContent = message;
    
    // Dodaj do DOM
    document.body.appendChild(messageContainer);
    
    // Usuń po 3 sekundach
    setTimeout(() => {
        messageContainer.remove();
    }, 3000);
}

// Funkcja do walidacji formularza
export function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// Funkcja do walidacji hasła
export function validatePasswords(password, confirmPassword) {
    if (password !== confirmPassword) {
        return 'Hasła nie są takie same!';
    }
    if (!validatePassword(password)) {
        return 'Hasło musi mieć co najmniej 6 znaków!';
    }
    return null;
}

// Funkcja do walidacji email
export function validateEmailField(email) {
    if (!validateEmail(email)) {
        return 'Nieprawidłowy format email!';
    }
    return null;
}

// Funkcja do walidacji nazwy użytkownika
export function validateUsername(username) {
    if (username.length < 3) {
        return 'Nazwa użytkownika musi mieć co najmniej 3 znaki!';
    }
    return null;
}

// Funkcja do walidacji bio
export function validateBio(bio) {
    if (bio.length > 160) {
        return 'Bio nie może być dłuższe niż 160 znaków!';
    }
    return null;
}

// Funkcja do walidacji zdjęcia
export function validateImage(file) {
    if (!file) return null;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        return 'Dozwolone są tylko zdjęcia w formacie JPEG, PNG lub GIF!';
    }
    
    if (file.size > 5 * 1024 * 1024) {
        return 'Zdjęcie nie może być większe niż 5MB!';
    }
    
    return null;
}
