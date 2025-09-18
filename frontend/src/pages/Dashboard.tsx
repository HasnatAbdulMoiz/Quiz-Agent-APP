import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import {
  BookOpen,
  Users,
  BarChart3,
  Plus,
  Brain,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiService.getAnalytics(),
    enabled: user?.role === 'teacher' || user?.role === 'admin',
  });

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => apiService.getQuizzes(0, 5),
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBasedContent = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsLoading ? '...' : analytics?.total_quizzes || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsLoading ? '...' : analytics?.total_students || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Average Score</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsLoading ? '...' : `${analytics?.average_score?.toFixed(1) || 0}%`}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsLoading ? '...' : `${analytics?.completion_rate?.toFixed(1) || 0}%`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'teacher':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">My Quizzes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsLoading ? '...' : analytics?.total_quizzes || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Students</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsLoading ? '...' : analytics?.total_students || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Score</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsLoading ? '...' : `${analytics?.average_score?.toFixed(1) || 0}%`}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completion</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsLoading ? '...' : `${analytics?.completion_rate?.toFixed(1) || 0}%`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'student':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Available Quizzes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {quizzesLoading ? '...' : quizzes?.length || 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">In Progress</p>
                  <p className="text-2xl font-semibold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/quizzes/create"
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <Plus className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Create Quiz</h3>
                  <p className="text-sm text-gray-500">Create a new quiz manually</p>
                </div>
              </div>
            </Link>
            <Link
              to="/quizzes/create"
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <Brain className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">AI Generate</h3>
                  <p className="text-sm text-gray-500">Generate quiz with AI</p>
                </div>
              </div>
            </Link>
            <Link
              to="/analytics"
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-500">System performance metrics</p>
                </div>
              </div>
            </Link>
          </div>
        );

      case 'teacher':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/quizzes/create"
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <Plus className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Create Quiz</h3>
                  <p className="text-sm text-gray-500">Create a new quiz manually</p>
                </div>
              </div>
            </Link>
            <Link
              to="/quizzes/create"
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <Brain className="h-6 w-6 text-purple-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">AI Generate</h3>
                  <p className="text-sm text-gray-500">Generate quiz with AI</p>
                </div>
              </div>
            </Link>
            <Link
              to="/analytics"
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <BarChart3 className="h-6 w-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">View Analytics</h3>
                  <p className="text-sm text-gray-500">Student performance metrics</p>
                </div>
              </div>
            </Link>
          </div>
        );

      case 'student':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/quizzes"
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <BookOpen className="h-6 w-6 text-primary-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Browse Quizzes</h3>
                  <p className="text-sm text-gray-500">Find quizzes to take</p>
                </div>
              </div>
            </Link>
            <Link
              to="/profile"
              className="card hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center">
                <Award className="h-6 w-6 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">My Progress</h3>
                  <p className="text-sm text-gray-500">View your quiz results</p>
                </div>
              </div>
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.full_name}!
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Welcome to the AI Quiz System. Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      {getRoleBasedContent()}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        {getQuickActions()}
      </div>

      {/* Recent Quizzes */}
      {(user?.role === 'teacher' || user?.role === 'admin') && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Quizzes</h2>
          <div className="card">
            {quizzesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading quizzes...</p>
              </div>
            ) : quizzes && quizzes.length > 0 ? (
              <div className="space-y-4">
                {quizzes.map((quiz: any) => (
                  <div key={quiz.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                      <p className="text-sm text-gray-500">{quiz.subject} • {quiz.grade_level}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        quiz.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quiz.status}
                      </span>
                      <Link
                        to={`/quizzes/${quiz.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No quizzes found</p>
                <Link
                  to="/quizzes/create"
                  className="mt-2 inline-flex items-center text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Create your first quiz
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
