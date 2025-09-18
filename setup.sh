#!/bin/bash

# AI Quiz System Setup Script
echo "🔧 Setting up AI Quiz System..."

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Please install Node.js 18+ first." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Please install Python 3.11+ first." >&2; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL is required but not installed. Please install PostgreSQL 15+ first." >&2; exit 1; }

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "Setting up frontend..."
cd frontend
npm install
cd ..

# Install mobile dependencies
echo "Setting up mobile app..."
cd mobile
npm install
cd ..

echo "🗄️ Setting up database..."

# Create database
createdb quiz_system 2>/dev/null || echo "Database 'quiz_system' already exists"

echo "⚙️ Setting up environment variables..."

# Create backend .env file
cat > backend/.env << EOF
DATABASE_URL=postgresql://postgres:password@localhost:5432/quiz_system
GEMINI_API_KEY=AIzaSyDom09ZeJmXM-nbKs1z05YKMDqNSU4gbyk
JWT_SECRET_KEY=your-super-secret-jwt-key-here-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
APP_NAME=AI Quiz System
APP_VERSION=1.0.0
DEBUG=True
EOF

# Create frontend .env file
cat > frontend/.env << EOF
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=AI Quiz System
EOF

echo "🏗️ Initializing database..."

# Run database migrations
cd backend
source venv/bin/activate
python -c "
from app.database import engine
from app.models import Base
Base.metadata.create_all(bind=engine)
print('Database tables created successfully!')
"
cd ..

echo "✅ Setup completed successfully!"
echo ""
echo "🚀 To start the development servers:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Mobile (Terminal 3):"
echo "  cd mobile"
echo "  expo start"
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "👤 Demo accounts:"
echo "  Admin: admin / password123"
echo "  Teacher: teacher / password123"
echo "  Student: student / password123"
echo ""
echo "🎉 Happy coding!"
