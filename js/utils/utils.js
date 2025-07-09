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
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return re.test(password);
}

// Funkcja do ładowania elementu
export function showLoading(element) {
    element.style.opacity = '0.5';
    element.style.pointerEvents = 'none';
}

// Funkcja do ukrywania elementu
export function hideLoading(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Funkcja do wyświetlenia komunikatu
export function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Dodaj do body
    document.body.appendChild(messageDiv);
    
    // Ustaw style
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 30px;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        font-family: 'Roboto', sans-serif;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Ustaw kolor tła na podstawie typu
    if (type === 'success') {
        messageDiv.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        messageDiv.style.backgroundColor = '#F44336';
    } else if (type === 'warning') {
        messageDiv.style.backgroundColor = '#FFC107';
    }
    
    // Animacja znikania
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Funkcja do walidacji formularza
export function validateForm(form) {
    let isValid = true;
    
    // Sprawdź wszystkie pola
    const inputs = form.querySelectorAll('input, textarea');
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
        return false;
    }
    return true;
}

// Funkcja do walidacji email
export function validateEmailField(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Funkcja do walidacji nazwy użytkownika
export function validateUsername(username) {
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
}

// Funkcja do walidacji bio
export function validateBio(bio) {
    return bio.length <= 160;
}

// Funkcja do walidacji zdjęcia
export function validateImage(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.type)) {
        return 'Nieprawidłowy format pliku. Dopuszczalne formaty: JPEG, PNG, GIF.';
    }
    
    if (file.size > maxSize) {
        return 'Plik jest za duży. Maksymalny rozmiar: 5MB.';
    }
    
    return null;
}
