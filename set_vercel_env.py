#!/usr/bin/env python3
"""
Script to set Vercel environment variables
"""

import subprocess
import sys

def set_vercel_env():
    """Set all required environment variables for Vercel"""
    
    env_vars = {
        "GEMINI_API_KEY": "AIzaSyDom09ZeJmXM-nbKs1z05YKMDqNSU4gbyk",
        "DATABASE_URL": "postgresql://default:tp2Nnx9quTzH@ep-odd-bush-a44p852m-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require&channel_binding=require",
        "JWT_SECRET_KEY": "your-super-secret-jwt-key-change-this-in-production",
        "CORS_ORIGINS": "[\"https://your-frontend.vercel.app\"]"
    }
    
    print("🔧 Setting up Vercel environment variables...")
    
    for key, value in env_vars.items():
        try:
            print(f"Setting {key}...")
            # Use echo to pipe the value to vercel env add
            cmd = f'echo "{value}" | vercel env add {key} production'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ {key} set successfully")
            else:
                print(f"❌ Failed to set {key}: {result.stderr}")
                
        except Exception as e:
            print(f"❌ Error setting {key}: {e}")
    
    print("🎉 Environment variables setup complete!")

if __name__ == "__main__":
    set_vercel_env()
