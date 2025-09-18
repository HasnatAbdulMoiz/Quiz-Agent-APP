import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../services/api';
import { QuizCreate, AIGenerationRequest } from '../types';
import {
  Brain,
  Plus,
  Save,
  Eye,
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';

const QuizCreate: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAIGeneration, setIsAIGeneration] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuizCreate>();

  const createQuizMutation = useMutation({
    mutationFn: (data: QuizCreate) => apiService.createQuiz(data),
    onSuccess: (quiz) => {
      toast.success('Quiz created successfully!');
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      navigate(`/quizzes/${quiz.id}`);
    },
    onError: (error) => {
      toast.error('Failed to create quiz');
      console.error('Error creating quiz:', error);
    },
  });

  const generateAIMutation = useMutation({
    mutationFn: (data: AIGenerationRequest) => apiService.generateQuizWithAI(data),
    onSuccess: (response) => {
      toast.success('Quiz generated successfully with AI!');
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      navigate(`/quizzes/${response.quiz_id}`);
    },
    onError: (error) => {
      toast.error('Failed to generate quiz with AI');
      console.error('Error generating quiz:', error);
    },
  });

  const onSubmit = async (data: QuizCreate) => {
    createQuizMutation.mutate(data);
  };

  const onAIGenerate = async (data: any) => {
    setIsGenerating(true);
    try {
      const aiRequest: AIGenerationRequest = {
        subject: data.subject,
        grade_level: data.grade_level,
        topic: data.topic,
        number_of_questions: parseInt(data.number_of_questions),
        difficulty_level: data.difficulty_level,
        question_types: data.question_types || ['multiple_choice'],
        custom_prompt: data.custom_prompt,
      };
      generateAIMutation.mutate(aiRequest);
    } catch (error) {
      console.error('Error in AI generation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
            <p className="text-gray-600">Create a new quiz or generate one with AI</p>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="card">
        <div className="flex space-x-4">
          <button
            onClick={() => setIsAIGeneration(false)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              !isAIGeneration
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Plus className="h-5 w-5 inline mr-2" />
            Manual Creation
          </button>
          <button
            onClick={() => setIsAIGeneration(true)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              isAIGeneration
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Brain className="h-5 w-5 inline mr-2" />
            AI Generation
          </button>
        </div>
      </div>

      {/* Manual Creation Form */}
      {!isAIGeneration && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quiz Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  Quiz Title *
                </label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  type="text"
                  className="input"
                  placeholder="Enter quiz title"
                />
                {errors.title && (
                  <p className="form-error">{errors.title.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  Subject *
                </label>
                <input
                  {...register('subject', { required: 'Subject is required' })}
                  type="text"
                  className="input"
                  placeholder="e.g., Mathematics, Science"
                />
                {errors.subject && (
                  <p className="form-error">{errors.subject.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="grade_level" className="form-label">
                  Grade Level *
                </label>
                <select
                  {...register('grade_level', { required: 'Grade level is required' })}
                  className="input"
                >
                  <option value="">Select grade level</option>
                  <option value="Elementary">Elementary (K-5)</option>
                  <option value="Middle School">Middle School (6-8)</option>
                  <option value="High School">High School (9-12)</option>
                  <option value="College">College</option>
                  <option value="Adult">Adult Education</option>
                </select>
                {errors.grade_level && (
                  <p className="form-error">{errors.grade_level.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="duration_minutes" className="form-label">
                  Duration (minutes) *
                </label>
                <input
                  {...register('duration_minutes', { 
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 minute' }
                  })}
                  type="number"
                  className="input"
                  placeholder="30"
                  min="1"
                />
                {errors.duration_minutes && (
                  <p className="form-error">{errors.duration_minutes.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="max_attempts" className="form-label">
                  Max Attempts *
                </label>
                <input
                  {...register('max_attempts', { 
                    required: 'Max attempts is required',
                    min: { value: 1, message: 'Must allow at least 1 attempt' }
                  })}
                  type="number"
                  className="input"
                  placeholder="1"
                  min="1"
                />
                {errors.max_attempts && (
                  <p className="form-error">{errors.max_attempts.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="passing_score" className="form-label">
                  Passing Score (%) *
                </label>
                <input
                  {...register('passing_score', { 
                    required: 'Passing score is required',
                    min: { value: 0, message: 'Passing score must be at least 0%' },
                    max: { value: 100, message: 'Passing score must be at most 100%' }
                  })}
                  type="number"
                  className="input"
                  placeholder="60"
                  min="0"
                  max="100"
                />
                {errors.passing_score && (
                  <p className="form-error">{errors.passing_score.message}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="input"
                placeholder="Describe what this quiz covers..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/quizzes')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createQuizMutation.isPending}
              className="btn btn-primary inline-flex items-center"
            >
              {createQuizMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Quiz
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* AI Generation Form */}
      {isAIGeneration && (
        <AIGenerationForm 
          onSubmit={onAIGenerate}
          isGenerating={isGenerating}
          onCancel={() => navigate('/quizzes')}
        />
      )}
    </div>
  );
};

const AIGenerationForm: React.FC<{
  onSubmit: (data: any) => void;
  isGenerating: boolean;
  onCancel: () => void;
}> = ({ onSubmit, isGenerating, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="card">
        <div className="flex items-center mb-6">
          <Brain className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">AI Quiz Generation</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="subject" className="form-label">
              Subject *
            </label>
            <input
              {...register('subject', { required: 'Subject is required' })}
              type="text"
              className="input"
              placeholder="e.g., Mathematics, Science, History"
            />
            {errors.subject && (
              <p className="form-error">{errors.subject.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="grade_level" className="form-label">
              Grade Level *
            </label>
            <select
              {...register('grade_level', { required: 'Grade level is required' })}
              className="input"
            >
              <option value="">Select grade level</option>
              <option value="Elementary">Elementary (K-5)</option>
              <option value="Middle School">Middle School (6-8)</option>
              <option value="High School">High School (9-12)</option>
              <option value="College">College</option>
              <option value="Adult">Adult Education</option>
            </select>
            {errors.grade_level && (
              <p className="form-error">{errors.grade_level.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="topic" className="form-label">
              Topic *
            </label>
            <input
              {...register('topic', { required: 'Topic is required' })}
              type="text"
              className="input"
              placeholder="e.g., Algebra, Photosynthesis, World War II"
            />
            {errors.topic && (
              <p className="form-error">{errors.topic.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="number_of_questions" className="form-label">
              Number of Questions *
            </label>
            <input
              {...register('number_of_questions', { 
                required: 'Number of questions is required',
                min: { value: 1, message: 'Must have at least 1 question' },
                max: { value: 50, message: 'Maximum 50 questions' }
              })}
              type="number"
              className="input"
              placeholder="10"
              min="1"
              max="50"
            />
            {errors.number_of_questions && (
              <p className="form-error">{errors.number_of_questions.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="difficulty_level" className="form-label">
              Difficulty Level *
            </label>
            <select
              {...register('difficulty_level', { required: 'Difficulty level is required' })}
              className="input"
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            {errors.difficulty_level && (
              <p className="form-error">{errors.difficulty_level.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="question_types" className="form-label">
              Question Types
            </label>
            <div className="space-y-2">
              {['multiple_choice', 'true_false', 'short_answer', 'essay'].map((type) => (
                <label key={type} className="flex items-center">
                  <input
                    {...register('question_types')}
                    type="checkbox"
                    value={type}
                    defaultChecked={type === 'multiple_choice'}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="custom_prompt" className="form-label">
            Custom Instructions (Optional)
          </label>
          <textarea
            {...register('custom_prompt')}
            rows={3}
            className="input"
            placeholder="Add any specific instructions for the AI..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isGenerating}
          className="btn btn-primary inline-flex items-center"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating with AI...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Generate Quiz
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default QuizCreate;
