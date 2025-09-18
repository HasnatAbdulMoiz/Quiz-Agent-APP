from fastapi import FastAPI
import os

app = FastAPI(title="AI Quiz System API", version="1.0.0")

@app.get("/")
async def root():
    return {"message": "AI Quiz System API is running!", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "AI Quiz System is running"}

@app.get("/test")
async def test():
    return {"test": "success", "env": os.getenv("GEMINI_API_KEY", "not_set")[:10] + "..."}
