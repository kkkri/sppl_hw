from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'
app.config['DATABASE'] = os.path.join(app.root_path, 'static', 'user.db')

def get_db_connection():
    conn = sqlite3.connect(app.config['DATABASE'])
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with app.app_context():
        conn = get_db_connection()
        conn.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)')
        conn.commit()
        conn.close()

init_db()

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login_post():
    username = request.form['username']
    password = request.form['password']
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ? AND password = ?', 
                       (username, password)).fetchone()
    conn.close()
    
    if user:
        session['user_id'] = user['id']
        session['username'] = user['username']
        return redirect(url_for('home'))
    else:
        flash('Invalid credentials. Please try again.')
        return redirect(url_for('login'))

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/register', methods=['POST'])
def register_post():
    username = request.form['username']
    password = request.form['password']
    
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO users (username, password) VALUES (?, ?)',
                    (username, password))
        conn.commit()
        flash('Registration successful! Please login.')
    except sqlite3.IntegrityError:
        flash('Username already exists. Please choose another.')
        return redirect(url_for('register'))
    finally:
        conn.close()
    
    return redirect(url_for('login'))

@app.route('/home')
def home():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('home.html', username=session['username'], current_date=datetime.now().strftime("%d %B, %Y"))

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return redirect(url_for('login'))


# Add these new routes
@app.route('/aboutus')
def aboutus():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('aboutus.html')

@app.route('/contactus')
def contactus():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('contactus.html')

@app.route('/options')
def options():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('options.html')

if __name__ == '__main__':
    app.run(debug=True)
