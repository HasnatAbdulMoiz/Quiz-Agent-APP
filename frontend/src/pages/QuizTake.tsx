import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { AnswerCreate } from '../types';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Submit
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizTake: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [quizStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(0);

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', id],
    queryFn: () => apiService.getQuiz(Number(id)),
    enabled: !!id,
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions', id],
    queryFn: () => apiService.getQuizQuestions(Number(id)),
    enabled: !!id,
  });

  const submitQuizMutation = useMutation({
    mutationFn: (answersData: AnswerCreate[]) => apiService.takeQuiz(Number(id), answersData),
    onSuccess: (result) => {
      toast.success('Quiz submitted successfully!');
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
      navigate(`/quizzes/${id}/result`, { state: { result } });
    },
    onError: (error) => {
      toast.error('Failed to submit quiz');
      console.error('Error submitting quiz:', error);
    },
  });

  // Timer effect
  useEffect(() => {
    if (!quiz) return;

    const duration = quiz.duration_minutes * 60 * 1000; // Convert to milliseconds
    setTimeRemaining(duration);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          // Time's up, auto-submit
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz]);

  // Track time spent on current question
  useEffect(() => {
    const startTime = Date.now();
    const currentQuestionId = questions?.[currentQuestionIndex]?.id;

    return () => {
      if (currentQuestionId) {
        const timeSpentOnQuestion = Date.now() - startTime;
        setTimeSpent(prev => ({
          ...prev,
          [currentQuestionId]: (prev[currentQuestionId] || 0) + timeSpentOnQuestion
        }));
      }
    };
  }, [currentQuestionIndex, questions]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!questions) return;

    const answersData: AnswerCreate[] = questions.map((question: any) => ({
      question_id: question.id,
      answer_text: answers[question.id] || '',
      time_spent: Math.round((timeSpent[question.id] || 0) / 1000), // Convert to seconds
    }));

    submitQuizMutation.mutate(answersData);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!questions) return 0;
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  const isLastQuestion = currentQuestionIndex === (questions?.length || 0) - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const currentQuestion = questions?.[currentQuestionIndex];

  if (quizLoading || questionsLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz || !questions || questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz not found</h3>
        <p className="text-gray-500 mb-4">The quiz you're looking for doesn't exist or has no questions.</p>
        <button onClick={() => navigate('/quizzes')} className="btn btn-primary">
          Back to Quizzes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/quizzes/${id}`)}
              className="btn btn-secondary inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.subject} • {quiz.grade_level}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      {/* Question */}
      {currentQuestion && (
        <div className="card">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Question {currentQuestionIndex + 1}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                  {currentQuestion.question_type.replace('_', ' ')}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <p className="text-lg text-gray-800 mb-6">{currentQuestion.question_text}</p>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
              currentQuestion.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answers[currentQuestion.id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    {answers[currentQuestion.id] === option ? (
                      <CheckCircle className="h-5 w-5 text-primary-600 mr-3" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 mr-3" />
                    )}
                    <span className="text-gray-800">{option}</span>
                  </div>
                </label>
              ))
            )}

            {currentQuestion.question_type === 'true_false' && (
              <div className="space-y-3">
                {['True', 'False'].map((option) => (
                  <label
                    key={option}
                    className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      {answers[currentQuestion.id] === option ? (
                        <CheckCircle className="h-5 w-5 text-primary-600 mr-3" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {(currentQuestion.question_type === 'short_answer' || currentQuestion.question_type === 'essay') && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder={`Enter your ${currentQuestion.question_type === 'essay' ? 'essay' : 'answer'} here...`}
                rows={currentQuestion.question_type === 'essay' ? 6 : 3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={isFirstQuestion}
            className="btn btn-secondary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary-600 text-white'
                    : answers[questions[index].id]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {isLastQuestion ? (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitQuizMutation.isPending}
              className="btn btn-primary inline-flex items-center"
            >
              {submitQuizMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Submit className="h-4 w-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="btn btn-primary inline-flex items-center"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          )}
        </div>
      </div>

      {/* Time Warning */}
      {timeRemaining <= 5 * 60 * 1000 && timeRemaining > 0 && (
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              Warning: You have {formatTime(timeRemaining)} remaining to complete the quiz.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTake;
