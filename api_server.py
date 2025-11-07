
#!/usr/bin/env python3
import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = Flask(__name__)
CORS(app)

def get_db_connection():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise Exception("DATABASE_URL environment variable not set")
    conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    return conn

def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create users table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create watch_history table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS watch_history (
            id SERIAL PRIMARY KEY,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            item_id TEXT NOT NULL,
            item_type TEXT NOT NULL,
            title TEXT,
            poster TEXT,
            watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create ratings table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS ratings (
            id SERIAL PRIMARY KEY,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            item_id TEXT NOT NULL,
            item_type TEXT NOT NULL,
            title TEXT,
            poster TEXT,
            rating INTEGER NOT NULL,
            rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, item_id, item_type)
        )
    ''')
    
    # Create watchlist table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS watchlist (
            id SERIAL PRIMARY KEY,
            user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
            item_id TEXT NOT NULL,
            item_type TEXT NOT NULL,
            title TEXT,
            poster TEXT,
            added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, item_id, item_type)
        )
    ''')
    
    conn.commit()
    cur.close()
    conn.close()

# User endpoints
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            'INSERT INTO users (id, name, email, password, avatar) VALUES (%s, %s, %s, %s, %s)',
            (data['id'], data['name'], data['email'], data['password'], data['avatar'])
        )
        conn.commit()
        return jsonify({'success': True})
    except psycopg2.IntegrityError:
        conn.rollback()
        return jsonify({'success': False, 'error': 'Email already exists'}), 400
    finally:
        cur.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        'SELECT id, name, email, avatar, created_at FROM users WHERE email = %s AND password = %s',
        (data['email'], data['password'])
    )
    user = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if user:
        return jsonify({'success': True, 'user': dict(user)})
    return jsonify({'success': False}), 401

@app.route('/api/user/<user_id>', methods=['GET', 'PUT'])
def user_profile(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    if request.method == 'GET':
        cur.execute('SELECT id, name, email, avatar, created_at FROM users WHERE id = %s', (user_id,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        return jsonify(dict(user) if user else {})
    
    elif request.method == 'PUT':
        data = request.json
        cur.execute('UPDATE users SET name = %s WHERE id = %s', (data['name'], user_id))
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})

# Watch history endpoints
@app.route('/api/watch-history/<user_id>', methods=['GET', 'POST'])
def watch_history(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    if request.method == 'GET':
        cur.execute(
            'SELECT * FROM watch_history WHERE user_id = %s ORDER BY watched_at DESC LIMIT 50',
            (user_id,)
        )
        history = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([dict(h) for h in history])
    
    elif request.method == 'POST':
        data = request.json
        cur.execute(
            'DELETE FROM watch_history WHERE user_id = %s AND item_id = %s AND item_type = %s',
            (user_id, data['id'], data['type'])
        )
        cur.execute(
            'INSERT INTO watch_history (user_id, item_id, item_type, title, poster) VALUES (%s, %s, %s, %s, %s)',
            (user_id, data['id'], data['type'], data.get('title'), data.get('poster'))
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})

# Ratings endpoints
@app.route('/api/ratings/<user_id>', methods=['GET', 'POST'])
def ratings(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    if request.method == 'GET':
        cur.execute('SELECT * FROM ratings WHERE user_id = %s', (user_id,))
        ratings = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([dict(r) for r in ratings])
    
    elif request.method == 'POST':
        data = request.json
        cur.execute(
            '''INSERT INTO ratings (user_id, item_id, item_type, title, poster, rating)
               VALUES (%s, %s, %s, %s, %s, %s)
               ON CONFLICT (user_id, item_id, item_type)
               DO UPDATE SET rating = %s, rated_at = CURRENT_TIMESTAMP''',
            (user_id, data['id'], data['type'], data.get('title'), data.get('poster'), data['rating'], data['rating'])
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})

@app.route('/api/rating/<user_id>/<item_id>/<item_type>', methods=['GET'])
def get_rating(user_id, item_id, item_type):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute(
        'SELECT rating FROM ratings WHERE user_id = %s AND item_id = %s AND item_type = %s',
        (user_id, item_id, item_type)
    )
    result = cur.fetchone()
    cur.close()
    conn.close()
    
    return jsonify({'rating': result['rating'] if result else 0})

# Watchlist endpoints
@app.route('/api/watchlist/<user_id>', methods=['GET', 'POST', 'DELETE'])
def watchlist(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    if request.method == 'GET':
        cur.execute('SELECT * FROM watchlist WHERE user_id = %s ORDER BY added_at DESC', (user_id,))
        watchlist = cur.fetchall()
        cur.close()
        conn.close()
        return jsonify([dict(w) for w in watchlist])
    
    elif request.method == 'POST':
        data = request.json
        try:
            cur.execute(
                'INSERT INTO watchlist (user_id, item_id, item_type, title, poster) VALUES (%s, %s, %s, %s, %s)',
                (user_id, data['id'], data['type'], data.get('title'), data.get('poster'))
            )
            conn.commit()
            cur.close()
            conn.close()
            return jsonify({'success': True, 'added': True})
        except psycopg2.IntegrityError:
            conn.rollback()
            cur.close()
            conn.close()
            return jsonify({'success': False, 'error': 'Already in watchlist'}), 400
    
    elif request.method == 'DELETE':
        data = request.json
        cur.execute(
            'DELETE FROM watchlist WHERE user_id = %s AND item_id = %s AND item_type = %s',
            (user_id, data['id'], data['type'])
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5001)
