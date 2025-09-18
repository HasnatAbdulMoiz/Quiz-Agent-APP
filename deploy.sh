#!/bin/bash

# AI Quiz System Deployment Script
echo "🚀 Starting AI Quiz System Deployment..."

# Check if required tools are installed
command -v vercel >/dev/null 2>&1 || { echo "❌ Vercel CLI is required but not installed. Please install it first." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed." >&2; exit 1; }

# Set environment variables
export GEMINI_API_KEY="AIzaSyDom09ZeJmXM-nbKs1z05YKMDqNSU4gbyk"

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install mobile dependencies
echo "Installing mobile dependencies..."
cd mobile
npm install
cd ..

echo "🔧 Building applications..."

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "🚀 Deploying to Vercel..."

# Deploy backend
echo "Deploying backend..."
cd backend
vercel --prod --yes
BACKEND_URL=$(vercel ls | grep backend | awk '{print $2}' | head -1)
echo "Backend deployed at: $BACKEND_URL"
cd ..

# Deploy frontend
echo "Deploying frontend..."
cd frontend
vercel --prod --yes
FRONTEND_URL=$(vercel ls | grep frontend | awk '{print $2}' | head -1)
echo "Frontend deployed at: $FRONTEND_URL"
cd ..

echo "✅ Deployment completed successfully!"
echo "🌐 Frontend URL: $FRONTEND_URL"
echo "🔧 Backend URL: $BACKEND_URL"
echo ""
echo "📱 To build the mobile app:"
echo "   cd mobile"
echo "   expo build:android"
echo "   expo build:ios"
echo ""
echo "🎉 Your AI Quiz System is now live!"
