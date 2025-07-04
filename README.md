# Meetify - Social Media Platform

Meetify to platforma social media napisana w HTML, CSS i JavaScript z wykorzystaniem Firebase jako backendu.

## Funkcjonalności

- Rejestracja i logowanie użytkowników
- Profil użytkownika z możliwościami edycji
- System postów z zdjęciami
- Wiadomości prywatne
- System powiadomień
- Wyszukiwanie użytkowników
- Obserwowanie innych użytkowników
- Lubię i komentarze do postów
- Tryb ciemny
- Responsywne UI

## Instalacja

1. Sklonuj repozytorium
2. Skonfiguruj Firebase:
   - Utwórz projekt w Firebase Console
   - Skopiuj plik `firebase-config.js` z konfiguracją
   - Włącz autentykację (Email/Password, Google)
   - Włącz Firestore
   - Włącz Storage

3. Dodaj wymagane pliki:
   - `images/logo.png` - logo aplikacji
   - `images/default-avatar.png` - domyślny avatar
   - `images/default-cover.jpg` - domyślny cover
   - `images/icons/*` - ikony aplikacji

## Struktura projektu

```
Meetify/
├── images/
│   ├── icons/
│   ├── avatars/
│   ├── logo.png
│   └── default-avatar.png
├── css/
│   ├── style.css
│   └── fonts/
├── js/
│   ├── auth.js
│   ├── profile.js
│   ├── messages.js
│   ├── notifications.js
│   ├── firebase-config.js
│   └── utils/
│       └── utils.js
├── index.html
├── login.html
├── register.html
├── app.html
├── profile.html
├── messages.html
└── notifications.html
```

## Technologie

- HTML5
- CSS3
- JavaScript (ES6+)
- Firebase (Auth, Firestore, Storage)
- Material Icons
- Roboto Font

## Wymagania

- Nowoczesna przeglądarka
- Internet
- Google Account (opcjonalnie dla logowania)

## Wspierane przeglądarki

- Google Chrome (najnowsza wersja)
- Mozilla Firefox (najnowsza wersja)
- Microsoft Edge (najnowsza wersja)
- Safari (najnowsza wersja)
