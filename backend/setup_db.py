#!/usr/bin/env python3
"""
Database setup script for AI Quiz System
"""

import sys
sys.path.append('.')

from app.database import engine
from app.models import Base
from app.auth import get_password_hash
from sqlalchemy import text

def setup_database():
    """Set up the database tables and demo data"""
    try:
        print("🔗 Setting up database schema...")
        
        with engine.connect() as conn:
            # Create enum types
            try:
                conn.execute(text("CREATE TYPE userrole AS ENUM ('admin', 'teacher', 'student')"))
                print("✅ Created userrole enum")
            except Exception:
                print("ℹ️  userrole enum already exists")
            
            try:
                conn.execute(text("CREATE TYPE quizstatus AS ENUM ('draft', 'published', 'archived')"))
                print("✅ Created quizstatus enum")
            except Exception:
                print("ℹ️  quizstatus enum already exists")
            
            try:
                conn.execute(text("CREATE TYPE questiontype AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay')"))
                print("✅ Created questiontype enum")
            except Exception:
                print("ℹ️  questiontype enum already exists")
            
            conn.commit()
        
        print("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created!")
        
        print("👥 Creating demo users...")
        create_demo_users()
        
        print("🎉 Database setup completed successfully!")
        print("📊 Your Neon database is ready!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

def create_demo_users():
    """Create demo users for testing"""
    demo_users = [
        {
            "email": "admin@quizsystem.com",
            "username": "admin",
            "full_name": "System Administrator",
            "role": "admin",
            "password": "password123"
        },
        {
            "email": "teacher@quizsystem.com", 
            "username": "teacher",
            "full_name": "Demo Teacher",
            "role": "teacher",
            "password": "password123"
        },
        {
            "email": "student@quizsystem.com",
            "username": "student", 
            "full_name": "Demo Student",
            "role": "student",
            "password": "password123"
        }
    ]
    
    with engine.connect() as conn:
        for user in demo_users:
            try:
                # Check if user already exists
                result = conn.execute(text("SELECT id FROM users WHERE username = :username"), 
                                    {"username": user["username"]})
                if result.fetchone():
                    print(f"ℹ️  User {user['username']} already exists")
                    continue
                
                # Create user
                hashed_password = get_password_hash(user["password"])
                conn.execute(text("""
                    INSERT INTO users (email, username, full_name, role, hashed_password, is_active)
                    VALUES (:email, :username, :full_name, :role, :hashed_password, :is_active)
                """), {
                    "email": user["email"],
                    "username": user["username"], 
                    "full_name": user["full_name"],
                    "role": user["role"],
                    "hashed_password": hashed_password,
                    "is_active": True
                })
                conn.commit()
                print(f"✅ Created user: {user['username']} ({user['role']})")
                
            except Exception as e:
                print(f"⚠️  Could not create user {user['username']}: {e}")

if __name__ == "__main__":
    setup_database()
