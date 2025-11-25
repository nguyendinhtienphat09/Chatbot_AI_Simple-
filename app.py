from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_cors import CORS
import google.generativeai as genai
import datetime
import hashlib
import secrets
import os

app = Flask(__name__, static_folder='static')
app.secret_key = secrets.token_hex(32)
CORS(app)

# 🔑 Gemini API Key
GEMINI_API_KEY = "AIzaSyA5Ea-svuxP85I4ajKL6JBgKK4bo2jIYqY"

# Database user đơn giản
users_db = {
    'admin': {
        'password': '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',  # password
        'name': 'Quản Trị Viên'
    },
    'user': {
        'password': '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',  # password  
        'name': 'Người Dùng'
    }
}

# Biến toàn cục
model = None
chat_sessions = {}

try:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')
    print("✅ Đã kết nối Gemini 2.0 Flash!")
except Exception as e:
    print(f"❌ Lỗi Gemini: {e}")
    model = None

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def is_logged_in():
    return 'user_id' in session

# ================= ROUTES =================

@app.route('/')
def home():
    if is_logged_in():
        return render_template('chat.html')
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        if is_logged_in():
            return redirect('/')
        return render_template('login.html')
    
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    
    if username in users_db and users_db[username]['password'] == hash_password(password):
        session['user_id'] = username
        session['user_name'] = users_db[username]['name']
        return jsonify({'success': True, 'message': f'Chào {users_db[username]["name"]}!'})
    else:
        return jsonify({'success': False, 'message': 'Sai tên đăng nhập hoặc mật khẩu'})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()
    name = data.get('name', '').strip()
    
    if not all([username, password, name]):
        return jsonify({'success': False, 'message': 'Vui lòng nhập đầy đủ'})
    
    if username in users_db:
        return jsonify({'success': False, 'message': 'Tên đăng nhập đã tồn tại'})
    
    users_db[username] = {
        'password': hash_password(password),
        'name': name
    }
    
    return jsonify({'success': True, 'message': 'Đăng ký thành công!'})

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/chat-api', methods=['POST'])
def chat_api():
    if not is_logged_in():
        return jsonify({'success': False, 'message': 'Vui lòng đăng nhập'})
    
    user_id = session['user_id']
    data = request.get_json()
    user_message = data.get('message', '').strip()
    
    if not user_message:
        return jsonify({'success': False, 'message': 'Tin nhắn trống'})
    
    try:
        # Xử lý với Gemini
        if model is None:
            response_text = "Xin chào! Tôi là chatbot. Hiện AI đang bảo trì."
            success = False
        else:
            chat = model.start_chat(history=[])
            response = chat.send_message(user_message)
            response_text = response.text
            success = True
        
        return jsonify({
            'success': success,
            'response': response_text,
            'timestamp': datetime.datetime.now().strftime("%H:%M:%S")
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': f'Lỗi: {str(e)}'})

@app.route('/profile')
def profile():
    if not is_logged_in():
        return redirect('/login')
    return render_template('chat.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Server chạy tại: http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)