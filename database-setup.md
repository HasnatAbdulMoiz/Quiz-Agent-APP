# Database Setup Guide

## Quick Setup Options:

### Option 1: Neon (Recommended - Free)
1. Visit: https://neon.tech
2. Sign up with GitHub
3. Create new project
4. Copy the connection string
5. Use as DATABASE_URL in Vercel

### Option 2: Supabase (Free)
1. Visit: https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy the connection string
5. Use as DATABASE_URL in Vercel

### Option 3: Vercel Postgres
1. Go to Vercel Dashboard
2. Select your project
3. Go to Storage tab
4. Create Postgres database
5. Copy the connection string

## Example DATABASE_URL:
```
postgresql://username:password@host:port/database_name
```

## For Local Development:
```bash
# Install PostgreSQL locally or use Docker
# Then use:
DATABASE_URL=postgresql://postgres:password@localhost:5432/quiz_system
```

## Environment Variables for Vercel:
- GEMINI_API_KEY: AIzaSyDom09ZeJmXM-nbKs1z05YKMDqNSU4gbyk
- JWT_SECRET_KEY: your-secret-key-here
- DATABASE_URL: your-postgres-connection-string
- CORS_ORIGINS: ["https://your-frontend.vercel.app"]
