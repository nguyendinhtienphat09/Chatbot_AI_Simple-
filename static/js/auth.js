// Xử lý đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    
    // Validate
    if (!username || !password) {
        showMessage('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showMessage(data.message, 'error');
        }
        
    } catch (error) {
        showMessage('Lỗi kết nối server', 'error');
        console.error('Login error:', error);
    }
}

// Xử lý đăng ký
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value;
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    
    // Validate
    if (!name || !username || !password) {
        alert('Vui lòng nhập đầy đủ thông tin');
        return;
    }
    
    if (password.length < 3) {
        alert('Mật khẩu phải có ít nhất 3 ký tự');
        return;
    }
    
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, username, password })
        });
        
        const data = await response.json();
        alert(data.message);
        
        if (data.success) {
            // Đóng modal và reset form
            closeRegisterModal();
            document.getElementById('registerForm').reset();
        }
        
    } catch (error) {
        alert('Lỗi kết nối server');
        console.error('Register error:', error);
    }
}

// Hiển thị message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Tự động ẩn sau 3 giây
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// Modal functions
function showRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Đóng modal khi click bên ngoài
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeRegisterModal();
            }
        });
    }
});