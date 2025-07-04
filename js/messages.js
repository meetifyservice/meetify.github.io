// Funkcje pomocnicze
function formatDate(date) {
    return new Date(date).toLocaleString();
}

// Funkcje do obsługi wiadomości
async function loadMessages(chatId) {
    try {
        const messagesRef = db.collection('messages').where('chatId', '==', chatId);
        const querySnapshot = await messagesRef.orderBy('timestamp', 'desc').limit(50).get();

        const messagesContainer = document.querySelector('.chat-messages');
        messagesContainer.innerHTML = ''; // Wyczyść istniejące wiadomości

        querySnapshot.docs.forEach(doc => {
            const message = doc.data();
            const messageElement = createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });

        // Przewiń do najnowszej wiadomości
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Błąd podczas ładowania wiadomości:', error);
    }
}

function createMessageElement(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.senderId === auth.currentUser.uid ? 'sent' : 'received'}`;
    messageElement.innerHTML = `
        <img src="${message.senderAvatar}" alt="Avatar" class="message-avatar">
        <div class="message-content">
            <p>${message.content}</p>
            <span class="message-time">${formatDate(message.timestamp)}</span>
        </div>
    `;
    return messageElement;
}

async function sendMessage(chatId, content) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const messageData = {
            chatId,
            content,
            senderId: user.uid,
            senderName: user.displayName || 'Użytkownik',
            senderAvatar: user.photoURL || 'images/default-avatar.png',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('messages').add(messageData);

        // Zaktualizuj ostatnią wiadomość w konwersacji
        await db.collection('chats').doc(chatId).update({
            lastMessage: content,
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
            unreadCount: firebase.firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Błąd podczas wysyłania wiadomości:', error);
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    // Obsługa wysyłania wiadomości
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.querySelector('.send-btn');
    const chatId = window.location.search.split('chatId=')[1]; // Pobierz chatId z URL

    if (messageInput && sendBtn && chatId) {
        sendBtn.addEventListener('click', async () => {
            const content = messageInput.value.trim();
            if (content) {
                await sendMessage(chatId, content);
                messageInput.value = '';
                await loadMessages(chatId);
            }
        });

        messageInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                await sendMessage(chatId, messageInput.value.trim());
                messageInput.value = '';
                await loadMessages(chatId);
            }
        });
    }

    // Załaduj wiadomości przy starcie
    if (chatId) {
        loadMessages(chatId);
    }

    // Obsługa kliknięcia na użytkownika w liście
    const usersList = document.querySelector('.users-list');
    if (usersList) {
        usersList.addEventListener('click', async (e) => {
            const userId = e.target.closest('.user-item')?.dataset.userId;
            if (userId) {
                // Utwórz nową konwersację lub załaduj istniejącą
                const userRef = db.collection('users').doc(userId);
                const userDoc = await userRef.get();
                const userData = userDoc.data();

                // Przekieruj do rozmowy
                window.location.href = `messages.html?chatId=${userId}-${auth.currentUser.uid}`;
            }
        });
    }

    // Sprawdź czy użytkownik jest zalogowany
    auth.onAuthStateChanged(user => {
        if (!user) {
            window.location.href = 'login.html';
        }
    });
});
