from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

class QuizStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    SHORT_ANSWER = "short_answer"
    ESSAY = "essay"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    role: UserRole = UserRole.STUDENT

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Quiz Schemas
class QuizBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    grade_level: str
    duration_minutes: int = 30
    max_attempts: int = 1
    passing_score: float = 60.0

class QuizCreate(QuizBase):
    pass

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[str] = None
    duration_minutes: Optional[int] = None
    max_attempts: Optional[int] = None
    passing_score: Optional[float] = None
    status: Optional[QuizStatus] = None

class QuizResponse(QuizBase):
    id: int
    status: QuizStatus
    is_ai_generated: bool
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    questions: List['QuestionResponse'] = []
    
    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    question_text: str
    question_type: QuestionType
    options: Optional[List[str]] = None
    correct_answer: str
    explanation: Optional[str] = None
    points: int = 1
    difficulty_level: str = "medium"

class QuestionCreate(QuestionBase):
    quiz_id: int

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    question_type: Optional[QuestionType] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    points: Optional[int] = None
    difficulty_level: Optional[str] = None

class QuestionResponse(QuestionBase):
    id: int
    order_index: int
    quiz_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Answer Schemas
class AnswerBase(BaseModel):
    answer_text: str
    time_spent: int = 0

class AnswerCreate(AnswerBase):
    question_id: int

class AnswerResponse(AnswerBase):
    id: int
    is_correct: bool
    points_earned: float
    question_id: int
    student_id: int
    quiz_result_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Quiz Result Schemas
class QuizResultBase(BaseModel):
    score: float
    total_points: float
    percentage: float
    time_spent: int
    attempt_number: int

class QuizResultCreate(QuizResultBase):
    quiz_id: int
    answers: List[AnswerCreate]

class QuizResultResponse(QuizResultBase):
    id: int
    student_id: int
    quiz_id: int
    completed_at: datetime
    analytics_data: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# AI Generation Schemas
class AIGenerationRequest(BaseModel):
    subject: str
    grade_level: str
    topic: str
    number_of_questions: int = 10
    difficulty_level: str = "medium"
    question_types: List[QuestionType] = [QuestionType.MULTIPLE_CHOICE]
    custom_prompt: Optional[str] = None

class AIGenerationResponse(BaseModel):
    quiz_id: int
    generated_questions: List[QuestionResponse]
    generation_metadata: Dict[str, Any]

# Analytics Schemas
class AnalyticsData(BaseModel):
    total_quizzes: int
    total_questions: int
    total_students: int
    average_score: float
    completion_rate: float
    performance_by_subject: Dict[str, float]
    performance_by_grade: Dict[str, float]
    recent_activity: List[Dict[str, Any]]

# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str = "info"

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Update forward references
QuizResponse.model_rebuild()
QuestionResponse.model_rebuild()
