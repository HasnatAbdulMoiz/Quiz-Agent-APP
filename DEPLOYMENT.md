# AI Quiz System - Deployment Guide

This guide will help you deploy the AI Quiz System to Vercel and prepare it for Google Play Store.

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Vercel CLI (`npm install -g vercel`)
- Git

### 1. Clone and Setup
```bash
git clone https://github.com/HasnatAbdulMoiz/Quiz-Agent-APP.git
cd Quiz-Agent-APP
chmod +x setup.sh
./setup.sh
```

### 2. Deploy to Vercel
```bash
chmod +x deploy.sh
./deploy.sh
```

## 📋 Manual Deployment Steps

### Backend Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard**
   - `GEMINI_API_KEY`: `AIzaSyDom09ZeJmXM-nbKs1z05YKMDqNSU4gbyk`
   - `JWT_SECRET_KEY`: Generate a secure secret key
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `CORS_ORIGINS`: Your frontend URL

### Frontend Deployment

1. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Set Environment Variables**
   - `VITE_API_URL`: Your backend URL from step 2
   - `VITE_APP_NAME`: AI Quiz System

### Database Setup

1. **Create PostgreSQL Database**
   - Use Vercel Postgres or external provider
   - Get connection string

2. **Run Migrations**
   ```bash
   cd backend
   alembic upgrade head
   ```

## 📱 Mobile App Deployment

### 1. Setup Expo
```bash
cd mobile
npm install -g @expo/cli
expo login
```

### 2. Build for Android
```bash
expo build:android
```

### 3. Build for iOS
```bash
expo build:ios
```

### 4. Google Play Store

1. **Prepare App Bundle**
   ```bash
   expo build:android -t app-bundle
   ```

2. **Upload to Play Console**
   - Go to [Google Play Console](https://play.google.com/console)
   - Create new app
   - Upload the generated AAB file
   - Fill in store listing details

3. **Required Information**
   - App name: AI Quiz System
   - Short description: AI-powered quiz creation and management system
   - Full description: Comprehensive quiz system with AI-generated content, multi-role support, and advanced analytics
   - Category: Education
   - Content rating: Everyone
   - Privacy policy URL: Your privacy policy URL

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
GEMINI_API_KEY=AIzaSyDom09ZeJmXM-nbKs1z05YKMDqNSU4gbyk
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["https://your-frontend.vercel.app"]
APP_NAME=AI Quiz System
APP_VERSION=1.0.0
DEBUG=False
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.vercel.app
VITE_APP_NAME=AI Quiz System
```

### Mobile (app.json)
```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-backend.vercel.app"
    }
  }
}
```

## 🗄️ Database Schema

The system includes the following main tables:
- `users` - User accounts with roles
- `quizzes` - Quiz information
- `questions` - Quiz questions
- `answers` - Student answers
- `quiz_results` - Quiz completion results
- `notifications` - User notifications

## 🔐 Security Considerations

1. **JWT Secret**: Use a strong, random secret key
2. **CORS**: Configure allowed origins properly
3. **Database**: Use connection pooling and SSL
4. **API Keys**: Store securely in environment variables
5. **HTTPS**: Always use HTTPS in production

## 📊 Monitoring and Analytics

1. **Vercel Analytics**: Enable in Vercel dashboard
2. **Error Tracking**: Consider adding Sentry
3. **Performance**: Monitor API response times
4. **Database**: Monitor connection usage

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ORIGINS environment variable
   - Ensure frontend URL is included

2. **Database Connection**
   - Verify DATABASE_URL format
   - Check database server accessibility

3. **API Key Issues**
   - Verify GEMINI_API_KEY is correct
   - Check API key permissions

4. **Build Failures**
   - Check Node.js and Python versions
   - Verify all dependencies are installed

### Support

For issues and questions:
- Check the logs in Vercel dashboard
- Review the API documentation at `/docs`
- Create an issue in the GitHub repository

## 🎉 Post-Deployment

After successful deployment:

1. **Test all functionality**
   - User registration/login
   - Quiz creation (manual and AI)
   - Quiz taking
   - Analytics dashboard

2. **Create demo accounts**
   - Admin: admin / password123
   - Teacher: teacher / password123
   - Student: student / password123

3. **Monitor performance**
   - Check response times
   - Monitor error rates
   - Review user feedback

4. **Update documentation**
   - Update README with live URLs
   - Document any custom configurations

## 🔄 Updates and Maintenance

1. **Regular Updates**
   - Keep dependencies updated
   - Monitor security advisories
   - Update API keys as needed

2. **Backup Strategy**
   - Regular database backups
   - Code repository backups
   - Environment variable backups

3. **Scaling**
   - Monitor usage patterns
   - Scale database as needed
   - Consider CDN for static assets

Your AI Quiz System is now ready for production use! 🚀
