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

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  QuizList: undefined;
  QuizDetail: { quizId: number };
  QuizTake: { quizId: number };
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Quizzes: undefined;
  Profile: undefined;
};
