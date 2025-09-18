#!/usr/bin/env python3
"""
Database setup script for AI Quiz System
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Your Neon database URL
DATABASE_URL = "postgresql://default:tp2Nnx9quTzH@ep-odd-bush-a44p852m-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require&channel_binding=require"

def setup_database():
    """Set up the database tables"""
    try:
        print("🔗 Connecting to Neon database...")
        engine = create_engine(DATABASE_URL)
        
        # Test connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected to PostgreSQL: {version}")
        
        print("📋 Creating database tables...")
        
        # Create tables using SQLAlchemy
        from backend.app.models import Base
        Base.metadata.create_all(bind=engine)
        
        print("✅ Database tables created successfully!")
        
        # Create demo users
        print("👥 Creating demo users...")
        create_demo_users(engine)
        
        print("🎉 Database setup completed successfully!")
        print(f"📊 Database URL: {DATABASE_URL}")
        
    except SQLAlchemyError as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

def create_demo_users(engine):
    """Create demo users for testing"""
    from backend.auth import get_password_hash
    
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
                    print(f"👤 User {user['username']} already exists")
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
