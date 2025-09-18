from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.database import engine, get_db
from app.models import Base
from app.auth import get_current_active_user, require_admin, require_teacher_or_admin
from app.schemas import (
    UserCreate, UserResponse, LoginRequest, Token,
    QuizCreate, QuizResponse, QuizUpdate,
    QuestionCreate, QuestionResponse, QuestionUpdate,
    QuizResultCreate, QuizResultResponse,
    AIGenerationRequest, AIGenerationResponse,
    AnalyticsData, NotificationResponse
)
from app.models import User, Quiz, Question, QuizResult, Notification
from app.ai_agent.quiz_generator import QuizGenerator

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting AI Quiz System...")
    yield
    # Shutdown
    print("Shutting down AI Quiz System...")

app = FastAPI(
    title="AI Quiz System API",
    description="A comprehensive AI-powered quiz system with Gemini integration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI generator
quiz_generator = QuizGenerator()

# Authentication endpoints
@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email or username already registered"
        )
    
    # Create new user
    from backend.auth import get_password_hash
    hashed_password = get_password_hash(user_data.password)
    
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        role=user_data.role,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/auth/login", response_model=Token)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login user and return access token."""
    from backend.auth import verify_password, create_access_token
    
    user = db.query(User).filter(User.username == login_data.username).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

# User management endpoints
@app.get("/users", response_model=list[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users (admin only)."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get user by ID (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Quiz endpoints
@app.post("/quizzes", response_model=QuizResponse)
async def create_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db)
):
    """Create a new quiz."""
    db_quiz = Quiz(
        title=quiz_data.title,
        description=quiz_data.description,
        subject=quiz_data.subject,
        grade_level=quiz_data.grade_level,
        duration_minutes=quiz_data.duration_minutes,
        max_attempts=quiz_data.max_attempts,
        passing_score=quiz_data.passing_score,
        created_by=current_user.id
    )
    
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    
    return db_quiz

@app.get("/quizzes", response_model=list[QuizResponse])
async def get_quizzes(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all quizzes."""
    if current_user.role == "student":
        # Students can only see published quizzes
        quizzes = db.query(Quiz).filter(Quiz.status == "published").offset(skip).limit(limit).all()
    else:
        # Teachers and admins can see all quizzes
        quizzes = db.query(Quiz).offset(skip).limit(limit).all()
    
    return quizzes

@app.get("/quizzes/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get quiz by ID."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check permissions
    if current_user.role == "student" and quiz.status != "published":
        raise HTTPException(status_code=403, detail="Quiz not available")
    
    return quiz

@app.put("/quizzes/{quiz_id}", response_model=QuizResponse)
async def update_quiz(
    quiz_id: int,
    quiz_data: QuizUpdate,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db)
):
    """Update quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check if user owns the quiz or is admin
    if current_user.role != "admin" and quiz.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this quiz")
    
    # Update fields
    for field, value in quiz_data.dict(exclude_unset=True).items():
        setattr(quiz, field, value)
    
    db.commit()
    db.refresh(quiz)
    
    return quiz

@app.delete("/quizzes/{quiz_id}")
async def delete_quiz(
    quiz_id: int,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db)
):
    """Delete quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check if user owns the quiz or is admin
    if current_user.role != "admin" and quiz.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this quiz")
    
    db.delete(quiz)
    db.commit()
    
    return {"message": "Quiz deleted successfully"}

# AI Quiz Generation
@app.post("/ai/generate-quiz", response_model=AIGenerationResponse)
async def generate_quiz_with_ai(
    request: AIGenerationRequest,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db)
):
    """Generate a quiz using AI."""
    try:
        # Generate quiz content using AI
        quiz_data = quiz_generator.generate_quiz_content(request)
        
        # Create quiz in database
        db_quiz = Quiz(
            title=quiz_data["title"],
            description=quiz_data["description"],
            subject=request.subject,
            grade_level=request.grade_level,
            duration_minutes=30,  # Default duration
            max_attempts=1,
            passing_score=60.0,
            is_ai_generated=True,
            ai_prompt=request.custom_prompt or f"Generate {request.number_of_questions} questions about {request.topic}",
            created_by=current_user.id,
            status="draft"
        )
        
        db.add(db_quiz)
        db.commit()
        db.refresh(db_quiz)
        
        # Create questions
        questions = quiz_generator.create_questions_in_db(quiz_data, db_quiz.id, db)
        
        return AIGenerationResponse(
            quiz_id=db_quiz.id,
            generated_questions=[QuestionResponse.from_orm(q) for q in questions],
            generation_metadata={
                "ai_model": "gemini-pro",
                "generation_time": "2024-01-01T00:00:00Z",
                "request_params": request.dict()
            }
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

# Question endpoints
@app.post("/quizzes/{quiz_id}/questions", response_model=QuestionResponse)
async def create_question(
    quiz_id: int,
    question_data: QuestionCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db)
):
    """Create a question for a quiz."""
    # Check if quiz exists and user has permission
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    if current_user.role != "admin" and quiz.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to add questions to this quiz")
    
    db_question = Question(
        question_text=question_data.question_text,
        question_type=question_data.question_type,
        options=question_data.options,
        correct_answer=question_data.correct_answer,
        explanation=question_data.explanation,
        points=question_data.points,
        difficulty_level=question_data.difficulty_level,
        quiz_id=quiz_id
    )
    
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    return db_question

@app.get("/quizzes/{quiz_id}/questions", response_model=list[QuestionResponse])
async def get_quiz_questions(
    quiz_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all questions for a quiz."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Check permissions
    if current_user.role == "student" and quiz.status != "published":
        raise HTTPException(status_code=403, detail="Quiz not available")
    
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).order_by(Question.order_index).all()
    return questions

# Quiz taking endpoints
@app.post("/quizzes/{quiz_id}/take", response_model=QuizResultResponse)
async def take_quiz(
    quiz_id: int,
    answers_data: list[dict],
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit quiz answers and get results."""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    if quiz.status != "published":
        raise HTTPException(status_code=403, detail="Quiz not available")
    
    # Get quiz questions
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    if not questions:
        raise HTTPException(status_code=400, detail="Quiz has no questions")
    
    # Calculate score
    total_points = sum(q.points for q in questions)
    earned_points = 0
    time_spent = 0
    
    # Process answers
    for answer_data in answers_data:
        question_id = answer_data.get("question_id")
        answer_text = answer_data.get("answer_text", "")
        time_spent += answer_data.get("time_spent", 0)
        
        question = next((q for q in questions if q.id == question_id), None)
        if not question:
            continue
        
        # Check if answer is correct
        is_correct = False
        if question.question_type == "multiple_choice":
            is_correct = answer_text.strip().lower() == question.correct_answer.strip().lower()
        elif question.question_type == "true_false":
            is_correct = answer_text.strip().lower() == question.correct_answer.strip().lower()
        else:
            # For short answer and essay, use simple string matching
            is_correct = answer_text.strip().lower() in question.correct_answer.strip().lower()
        
        if is_correct:
            earned_points += question.points
    
    # Calculate percentage
    percentage = (earned_points / total_points) * 100 if total_points > 0 else 0
    
    # Create quiz result
    quiz_result = QuizResult(
        student_id=current_user.id,
        quiz_id=quiz_id,
        score=earned_points,
        total_points=total_points,
        percentage=percentage,
        time_spent=time_spent,
        attempt_number=1  # TODO: Calculate actual attempt number
    )
    
    db.add(quiz_result)
    db.commit()
    db.refresh(quiz_result)
    
    return quiz_result

# Analytics endpoints
@app.get("/analytics", response_model=AnalyticsData)
async def get_analytics(
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db)
):
    """Get system analytics."""
    # Get basic counts
    total_quizzes = db.query(Quiz).count()
    total_questions = db.query(Question).count()
    total_students = db.query(User).filter(User.role == "student").count()
    
    # Get average score
    results = db.query(QuizResult).all()
    average_score = sum(r.percentage for r in results) / len(results) if results else 0
    
    # Get completion rate
    total_attempts = len(results)
    completed_attempts = len([r for r in results if r.percentage >= 0])
    completion_rate = (completed_attempts / total_attempts * 100) if total_attempts > 0 else 0
    
    return AnalyticsData(
        total_quizzes=total_quizzes,
        total_questions=total_questions,
        total_students=total_students,
        average_score=average_score,
        completion_rate=completion_rate,
        performance_by_subject={},
        performance_by_grade={},
        recent_activity=[]
    )

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "AI Quiz System is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
