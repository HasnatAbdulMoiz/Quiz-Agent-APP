import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import {
  Search,
  Filter,
  Plus,
  BookOpen,
  Clock,
  Users,
  Brain,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const QuizList: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: quizzes, isLoading, refetch } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => apiService.getQuizzes(),
  });

  const filteredQuizzes = quizzes?.filter((quiz: any) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleDeleteQuiz = async (quizId: number) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await apiService.deleteQuiz(quizId);
        refetch();
      } catch (error) {
        console.error('Failed to delete quiz:', error);
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyStyles = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${difficultyStyles[difficulty as keyof typeof difficultyStyles] || difficultyStyles.medium}`}>
        {difficulty}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          <p className="mt-2 text-gray-600">
            {user?.role === 'student' 
              ? 'Browse and take available quizzes' 
              : 'Manage your quizzes and create new ones'
            }
          </p>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <div className="mt-4 sm:mt-0">
            <Link
              to="/quizzes/create"
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading quizzes...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first quiz'
            }
          </p>
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <Link
              to="/quizzes/create"
              className="btn btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Quiz
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz: any) => (
            <div key={quiz.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{quiz.subject}</p>
                  <p className="text-xs text-gray-500">{quiz.grade_level}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {quiz.is_ai_generated && (
                    <Brain className="h-4 w-4 text-purple-600" title="AI Generated" />
                  )}
                  {getStatusBadge(quiz.status)}
                </div>
              </div>

              {quiz.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {quiz.description}
                </p>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {quiz.duration_minutes} min
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {quiz.max_attempts} attempt{quiz.max_attempts !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {user?.role === 'student' ? (
                    <Link
                      to={`/quizzes/${quiz.id}/take`}
                      className="btn btn-primary text-sm"
                    >
                      Take Quiz
                    </Link>
                  ) : (
                    <>
                      <Link
                        to={`/quizzes/${quiz.id}`}
                        className="btn btn-secondary text-sm inline-flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/quizzes/${quiz.id}/edit`}
                        className="btn btn-secondary text-sm inline-flex items-center"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="btn btn-danger text-sm inline-flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(quiz.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
