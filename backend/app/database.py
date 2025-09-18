from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Use your Neon database URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://default:tp2Nnx9quTzH@ep-odd-bush-a44p852m-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require&channel_binding=require")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "options": "-c timezone=utc"
    }
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
