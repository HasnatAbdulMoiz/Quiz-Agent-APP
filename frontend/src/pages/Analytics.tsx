import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Clock,
  Target,
  Brain,
  BarChart3
} from 'lucide-react';

const Analytics: React.FC = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiService.getAnalytics(),
  });

  // Mock data for demonstration
  const performanceData = [
    { subject: 'Mathematics', score: 85, students: 120 },
    { subject: 'Science', score: 78, students: 95 },
    { subject: 'History', score: 82, students: 88 },
    { subject: 'English', score: 90, students: 110 },
    { subject: 'Geography', score: 75, students: 75 },
  ];

  const gradeLevelData = [
    { grade: 'Elementary', score: 88, quizzes: 45 },
    { grade: 'Middle School', score: 82, quizzes: 38 },
    { grade: 'High School', score: 79, quizzes: 42 },
    { grade: 'College', score: 85, quizzes: 25 },
  ];

  const timeSeriesData = [
    { date: '2024-01-01', completions: 45, score: 82 },
    { date: '2024-01-02', completions: 52, score: 85 },
    { date: '2024-01-03', completions: 38, score: 79 },
    { date: '2024-01-04', completions: 61, score: 87 },
    { date: '2024-01-05', completions: 48, score: 83 },
    { date: '2024-01-06', completions: 55, score: 86 },
    { date: '2024-01-07', completions: 42, score: 81 },
  ];

  const questionTypeData = [
    { name: 'Multiple Choice', value: 65, color: '#3B82F6' },
    { name: 'True/False', value: 20, color: '#10B981' },
    { name: 'Short Answer', value: 10, color: '#F59E0B' },
    { name: 'Essay', value: 5, color: '#EF4444' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Comprehensive insights into quiz performance and student engagement
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.total_quizzes || 0}
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
                {analytics?.total_students || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Score</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.average_score?.toFixed(1) || 0}%
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
                {analytics?.completion_rate?.toFixed(1) || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance by Subject */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Subject</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Question Type Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Question Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={questionTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {questionTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance by Grade Level */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance by Grade Level</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={gradeLevelData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time Series Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="completions" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Subjects */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Subjects</h3>
          <div className="space-y-4">
            {performanceData
              .sort((a, b) => b.score - a.score)
              .map((subject, index) => (
                <div key={subject.subject} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{subject.subject}</p>
                      <p className="text-sm text-gray-500">{subject.students} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{subject.score}%</p>
                    <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${subject.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {timeSeriesData.slice(-5).reverse().map((activity, index) => (
              <div key={activity.date} className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activity.completions} quiz completions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{activity.score}%</p>
                  <p className="text-xs text-gray-500">avg score</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card">
        <div className="flex items-center mb-6">
          <Brain className="h-6 w-6 text-purple-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Performance Trends</h4>
            <p className="text-sm text-purple-700">
              Student performance has improved by 12% over the last month, with Mathematics showing the highest growth.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Engagement Patterns</h4>
            <p className="text-sm text-blue-700">
              Peak quiz activity occurs between 10 AM and 2 PM, with completion rates highest during morning hours.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Recommendations</h4>
            <p className="text-sm text-green-700">
              Consider adding more interactive elements to Science quizzes to improve engagement and retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
