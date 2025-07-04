document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const chatList = document.getElementById('chat-list');
    const messageList = document.getElementById('message-list');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const userAvatar = document.getElementById('user-avatar');
    let currentChatId = null;

    // Weryfikacja statusu logowania
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Załaduj avatar użytkownika
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                if (userData.avatar) {
                    userAvatar.src = userData.avatar;
                }
            }
        });

        // Załaduj listę czatów
        loadChats();
    });

    // Załaduj listę czatów
    async function loadChats() {
        try {
            // Pobierz wszystkie czaty użytkownika
            const chatsSnapshot = await db.collection('chats')
                .where('participants', 'array-contains', auth.currentUser.uid)
                .orderBy('lastMessageTime', 'desc')
                .get();

            chatList.innerHTML = '';
            chatsSnapshot.forEach((doc) => {
                const chat = doc.data();
                const chatId = doc.id;

                // Pobierz dane drugiego użytkownika
                const otherUser = chat.participants.find(uid => uid !== auth.currentUser.uid);
                db.collection('users').doc(otherUser).get().then((userDoc) => {
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        const chatItem = document.createElement('div');
                        chatItem.className = `chat-item ${currentChatId === chatId ? 'active' : ''}`;
                        chatItem.setAttribute('data-chat-id', chatId);
                        chatItem.innerHTML = `
                            <img src="${userData.avatar || 'images/av.png'}" alt="${userData.displayName}" class="chat-avatar">
                            <div class="chat-info">
                                <h3>${userData.displayName}</h3>
                                <p>${chat.lastMessage || 'Brak wiadomości'}</p>
                            </div>
                        `;
                        chatItem.addEventListener('click', () => selectChat(chatId));
                        chatList.appendChild(chatItem);
                    }
                });
            });
        } catch (error) {
            console.error('Błąd podczas ładowania czatów:', error);
        }
    }

    // Wybór czatu
    function selectChat(chatId) {
        currentChatId = chatId;
        loadMessages(chatId);
        const chatItems = document.querySelectorAll('.chat-item');
        chatItems.forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-chat-id="${chatId}"]`).classList.add('active');
    }

    // Załaduj wiadomości
    async function loadMessages(chatId) {
        try {
            const messagesSnapshot = await db.collection('messages')
                .where('chatId', '==', chatId)
                .orderBy('timestamp', 'asc')
                .get();

            messageList.innerHTML = '';
            messagesSnapshot.forEach((doc) => {
                const message = doc.data();
                const messageElement = document.createElement('div');
                messageElement.className = `message ${message.senderId === auth.currentUser.uid ? 'sent' : 'received'}`;
                messageElement.innerHTML = `
                    <div class="message-content">${message.text}</div>
                    <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
                `;
                messageList.appendChild(messageElement);
            });

            // Przewiń do ostatniej wiadomości
            messageList.scrollTop = messageList.scrollHeight;
            messageList.scrollTop = messageList.scrollHeight;
        } catch (error) {
            console.error('Błąd podczas ładowania wiadomości:', error);
        }
    }

    // Wysyłanie wiadomości
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !currentChatId) return;

        try {
            const messageRef = db.collection('messages').doc();
            await messageRef.set({
                chatId: currentChatId,
                senderId: auth.currentUser.uid,
                text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Zaktualizuj ostatnią wiadomość w czacie
            await db.collection('chats').doc(currentChatId).update({
                lastMessage: text,
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
            });

            messageInput.value = '';
            loadMessages(currentChatId);
        } catch (error) {
            console.error('Błąd podczas wysyłania wiadomości:', error);
            alert('Wystąpił błąd podczas wysyłania wiadomości.');
        }
    }

    // Nasłuchuj na nowe wiadomości
    db.collection('messages')
        .where('chatId', '==', currentChatId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .onSnapshot((snapshot) => {
            if (currentChatId) {
                loadMessages(currentChatId);
            }
        });
});
