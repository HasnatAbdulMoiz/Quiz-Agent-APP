import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Eye,
  Clock,
  Users,
  Target,
  Brain,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: quiz, isLoading, refetch } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => apiService.getQuiz(Number(id)),
    enabled: !!id,
  });

  const { data: questions } = useQuery({
    queryKey: ['quiz-questions', id],
    queryFn: () => apiService.getQuizQuestions(Number(id)),
    enabled: !!id,
  });

  const handleDeleteQuiz = async () => {
    if (window.confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      try {
        await apiService.deleteQuiz(Number(id));
        toast.success('Quiz deleted successfully');
        navigate('/quizzes');
      } catch (error) {
        toast.error('Failed to delete quiz');
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz not found</h3>
        <p className="text-gray-500 mb-4">The quiz you're looking for doesn't exist.</p>
        <Link to="/quizzes" className="btn btn-primary">
          Back to Quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/quizzes')}
            className="btn btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
              {quiz.is_ai_generated && (
                <Brain className="h-6 w-6 text-purple-600" title="AI Generated" />
              )}
              {getStatusBadge(quiz.status)}
            </div>
            <p className="text-gray-600 mt-1">{quiz.subject} • {quiz.grade_level}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user?.role === 'student' ? (
            <Link
              to={`/quizzes/${quiz.id}/take`}
              className="btn btn-primary inline-flex items-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Take Quiz
            </Link>
          ) : (
            <>
              <Link
                to={`/quizzes/${quiz.id}/edit`}
                className="btn btn-secondary inline-flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
              <button
                onClick={handleDeleteQuiz}
                className="btn btn-danger inline-flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quiz Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Duration</p>
              <p className="text-2xl font-semibold text-gray-900">{quiz.duration_minutes} min</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Questions</p>
              <p className="text-2xl font-semibold text-gray-900">{questions?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Max Attempts</p>
              <p className="text-2xl font-semibold text-gray-900">{quiz.max_attempts}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Passing Score</p>
              <p className="text-2xl font-semibold text-gray-900">{quiz.passing_score}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {quiz.description && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700">{quiz.description}</p>
        </div>
      )}

      {/* Questions Preview */}
      {questions && questions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Questions Preview</h2>
            {user?.role === 'student' && (
              <Link
                to={`/quizzes/${quiz.id}/take`}
                className="btn btn-primary inline-flex items-center"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quiz
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {questions.slice(0, 3).map((question: any, index: number) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    Question {index + 1}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      {question.question_type.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {question.points} point{question.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{question.question_text}</p>
                {question.options && (
                  <div className="space-y-1">
                    {question.options.map((option: string, optionIndex: number) => (
                      <div key={optionIndex} className="text-sm text-gray-600">
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {questions.length > 3 && (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  And {questions.length - 3} more question{questions.length - 3 !== 1 ? 's' : ''}...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Generation Info */}
      {quiz.is_ai_generated && (
        <div className="card">
          <div className="flex items-center mb-4">
            <Brain className="h-6 w-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">AI Generation Details</h2>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              This quiz was generated using AI technology. The questions and answers have been 
              automatically created based on the specified topic and difficulty level.
            </p>
            {quiz.ai_prompt && (
              <div className="mt-3">
                <p className="text-sm font-medium text-purple-900 mb-1">Generation Prompt:</p>
                <p className="text-sm text-purple-700 italic">"{quiz.ai_prompt}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Metadata */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quiz Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Created:</span>
            <span className="ml-2 text-gray-600">
              {new Date(quiz.created_at).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Updated:</span>
            <span className="ml-2 text-gray-600">
              {quiz.updated_at ? new Date(quiz.updated_at).toLocaleDateString() : 'Never'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <span className="ml-2 text-gray-600 capitalize">{quiz.status}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Generated by:</span>
            <span className="ml-2 text-gray-600">
              {quiz.is_ai_generated ? 'AI Assistant' : 'Manual Creation'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
