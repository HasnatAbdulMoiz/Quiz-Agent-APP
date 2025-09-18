// User Types
export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserCreate {
  email: string;
  username: string;
  full_name: string;
  password: string;
  role: 'admin' | 'teacher' | 'student';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Quiz Types
export interface Quiz {
  id: number;
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  duration_minutes: number;
  max_attempts: number;
  passing_score: number;
  status: 'draft' | 'published' | 'archived';
  is_ai_generated: boolean;
  created_by: number;
  created_at: string;
  updated_at?: string;
  questions?: Question[];
}

export interface QuizCreate {
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  duration_minutes: number;
  max_attempts: number;
  passing_score: number;
}

export interface QuizUpdate {
  title?: string;
  description?: string;
  subject?: string;
  grade_level?: string;
  duration_minutes?: number;
  max_attempts?: number;
  passing_score?: number;
  status?: 'draft' | 'published' | 'archived';
}

// Question Types
export interface Question {
  id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  difficulty_level: string;
  order_index: number;
  quiz_id: number;
  created_at: string;
}

export interface QuestionCreate {
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points: number;
  difficulty_level: string;
  quiz_id: number;
}

// Answer Types
export interface Answer {
  id: number;
  answer_text: string;
  is_correct: boolean;
  points_earned: number;
  time_spent: number;
  question_id: number;
  student_id: number;
  quiz_result_id: number;
  created_at: string;
}

export interface AnswerCreate {
  question_id: number;
  answer_text: string;
  time_spent: number;
}

// Quiz Result Types
export interface QuizResult {
  id: number;
  student_id: number;
  quiz_id: number;
  score: number;
  total_points: number;
  percentage: number;
  time_spent: number;
  attempt_number: number;
  completed_at: string;
  analytics_data?: Record<string, any>;
}

// AI Generation Types
export interface AIGenerationRequest {
  subject: string;
  grade_level: string;
  topic: string;
  number_of_questions: number;
  difficulty_level: string;
  question_types: ('multiple_choice' | 'true_false' | 'short_answer' | 'essay')[];
  custom_prompt?: string;
}

export interface AIGenerationResponse {
  quiz_id: number;
  generated_questions: Question[];
  generation_metadata: Record<string, any>;
}

// Analytics Types
export interface AnalyticsData {
  total_quizzes: number;
  total_questions: number;
  total_students: number;
  average_score: number;
  completion_rate: number;
  performance_by_subject: Record<string, number>;
  performance_by_grade: Record<string, number>;
  recent_activity: Record<string, any>[];
}

// Notification Types
export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form Types
export interface FormError {
  field: string;
  message: string;
}

// Chart Types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}
