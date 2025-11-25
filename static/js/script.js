// Biến toàn cục
let isTyping = false;

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
});

function initializeChat() {
    // Hiển thị thời gian hiện tại
    const initialTime = document.getElementById('initialTime');
    if (initialTime) {
        initialTime.textContent = getCurrentTime();
    }
    
    // Xử lý form chat
    const chatForm = document.getElementById('chatForm');
    if (chatForm) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }
    
    // Focus vào input
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.focus();
        
        // Auto-resize input
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
    
    // Load lịch sử chat nếu có
    loadChatHistory();
}

// Xử lý gửi tin nhắn
async function handleChatSubmit(e) {
    e.preventDefault();
    
    if (isTyping) return;
    
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Hiển thị tin nhắn user
    addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Vô hiệu hóa input trong khi gửi
    setInputState(false);
    isTyping = true;
    
    try {
        // Hiển thị typing indicator
        showTypingIndicator();
        
        const response = await fetch('/chat-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        
        // Ẩn typing indicator
        hideTypingIndicator();
        
        if (data.success) {
            addMessage(data.response, 'bot');
        } else {
            addMessage('❌ ' + data.message, 'bot', true);
        }
        
    } catch (error) {
        hideTypingIndicator();
        addMessage('❌ Lỗi kết nối server. Vui lòng thử lại.', 'bot', true);
        console.error('Chat error:', error);
    } finally {
        // Kích hoạt lại input
        setInputState(true);
        isTyping = false;
    }
}

// Thêm tin nhắn vào giao diện
function addMessage(text, sender, isError = false) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    if (isError) {
        bubbleDiv.style.background = '#ffebee';
        bubbleDiv.style.borderColor = '#f44336';
        bubbleDiv.style.color = '#c62828';
    }
    
    bubbleDiv.textContent = text;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = getCurrentTime();
    
    bubbleDiv.appendChild(timeDiv);
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    
    // Tự động scroll xuống
    scrollToBottom();
    
    // Lưu vào lịch sử local
    saveToLocalHistory(text, sender);
}

// Hiển thị typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message bot-message typing';
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble typing-bubble';
    bubbleDiv.innerHTML = 'AI đang trả lời<span class="typing-dots">...</span>';
    
    typingDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(typingDiv);
    
    scrollToBottom();
}

// Ẩn typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Điều khiển trạng thái input
function setInputState(enabled) {
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    
    if (userInput) userInput.disabled = !enabled;
    if (sendBtn) {
        sendBtn.disabled = !enabled;
        sendBtn.textContent = enabled ? 'Gửi' : 'Đang gửi...';
    }
}

// Scroll xuống tin nhắn mới nhất
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Lấy thời gian hiện tại
function getCurrentTime() {
    return new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Lưu lịch sử vào localStorage
function saveToLocalHistory(message, sender) {
    try {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        history.push({
            message: message,
            sender: sender,
            timestamp: new Date().toISOString()
        });
        
        // Giới hạn lịch sử (50 tin nhắn)
        if (history.length > 50) {
            history.splice(0, history.length - 50);
        }
        
        localStorage.setItem('chatHistory', JSON.stringify(history));
    } catch (error) {
        console.error('Lỗi lưu lịch sử:', error);
    }
}

// Load lịch sử từ localStorage
function loadChatHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        const chatMessages = document.getElementById('chatMessages');
        
        if (!chatMessages || history.length === 0) return;
        
        // Xóa tin nhắn mặc định
        const defaultMessage = chatMessages.querySelector('.bot-message');
        if (defaultMessage && history.length > 0) {
            defaultMessage.remove();
        }
        
        // Hiển thị lịch sử
        history.forEach(item => {
            addMessage(item.message, item.sender);
        });
        
    } catch (error) {
        console.error('Lỗi load lịch sử:', error);
    }
}

// Xóa lịch sử chat
function clearChatHistory() {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
        localStorage.removeItem('chatHistory');
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message bot-message">
                    <div class="message-bubble">
                        Lịch sử chat đã được xóa. Hãy bắt đầu cuộc trò chuyện mới!
                        <div class="message-time">${getCurrentTime()}</div>
                    </div>
                </div>
            `;
        }
    }
}

// Xử lý phím tắt
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter để gửi tin nhắn
    if (e.ctrlKey && e.key === 'Enter') {
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.dispatchEvent(new Event('submit'));
        }
    }
    
    // Escape để xóa input
    if (e.key === 'Escape') {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.value = '';
            userInput.style.height = 'auto';
        }
    }
});

// Export functions cho global access
window.clearChatHistory = clearChatHistory;
window.showRegisterModal = showRegisterModal;
window.closeRegisterModal = closeRegisterModal;