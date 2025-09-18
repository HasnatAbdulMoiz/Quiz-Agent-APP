# AI-Powered Quiz System

A comprehensive web application that leverages Google's Gemini AI to automate quiz creation, administration, and analysis. The system includes multi-role authentication, AI quiz generation, advanced analytics, and mobile app support.

## Features

- 🤖 **AI-Powered Quiz Generation**: Uses Gemini AI to create intelligent quizzes
- 👥 **Multi-Role System**: Admin, Teacher, and Student roles with different permissions
- 📊 **Advanced Analytics**: Detailed performance tracking and insights
- 📱 **Mobile Ready**: React Native app for Google Play Store
- 🚀 **Vercel Deployed**: Full-stack deployment on Vercel
- 🔐 **Secure Authentication**: JWT-based authentication system
- 📈 **Real-time Analytics**: Live performance tracking and reporting

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **PostgreSQL**: Robust database system
- **SQLAlchemy**: Python SQL toolkit
- **Gemini AI**: Google's advanced AI model
- **JWT**: Secure authentication

### Frontend
- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool
- **React Query**: Data fetching and caching

### Mobile
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform for React Native

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HasnatAbdulMoiz/Quiz-Agent-APP.git
   cd Quiz-Agent-APP
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Add your Gemini API key to backend/.env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

5. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb quiz_system
   
   # Run migrations
   cd backend
   alembic upgrade head
   ```

6. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   uvicorn app.main:app --reload

   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

## Deployment

### Vercel Deployment

1. **Backend Deployment**
   ```bash
   cd backend
   vercel --prod
   ```

2. **Frontend Deployment**
   ```bash
   cd frontend
   vercel --prod
   ```

### Environment Variables

Set these in your Vercel dashboard:

**Backend:**
- `DATABASE_URL`: PostgreSQL connection string
- `GEMINI_API_KEY`: Your Gemini API key
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `CORS_ORIGINS`: Allowed CORS origins

**Frontend:**
- `VITE_API_URL`: Backend API URL
- `VITE_APP_NAME`: Application name

## API Documentation

Once deployed, visit `/docs` for interactive API documentation.

## Mobile App

The mobile app is built with React Native and can be deployed to Google Play Store:

```bash
cd mobile
npm install
npx expo start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, email support@quizagent.com or create an issue on GitHub.
