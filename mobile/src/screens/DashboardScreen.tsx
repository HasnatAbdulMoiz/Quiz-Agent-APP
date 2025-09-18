import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const DashboardScreen: React.FC = () => {
  const { user } = useAuth();

  const { data: analytics, isLoading: analyticsLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiService.getAnalytics(),
    enabled: user?.role === 'teacher' || user?.role === 'admin',
  });

  const { data: quizzes, isLoading: quizzesLoading, refetch: refetchQuizzes } = useQuery({
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
      case 'teacher':
        return (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="book" size={24} color="#3b82f6" />
              <Text style={styles.statNumber}>{analytics?.total_quizzes || 0}</Text>
              <Text style={styles.statLabel}>Total Quizzes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#10b981" />
              <Text style={styles.statNumber}>{analytics?.total_students || 0}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>{analytics?.average_score?.toFixed(1) || 0}%</Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color="#8b5cf6" />
              <Text style={styles.statNumber}>{analytics?.completion_rate?.toFixed(1) || 0}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        );

      case 'student':
        return (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="book" size={24} color="#3b82f6" />
              <Text style={styles.statNumber}>{quizzes?.length || 0}</Text>
              <Text style={styles.statLabel}>Available Quizzes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const getQuickActions = () => {
    switch (user?.role) {
      case 'admin':
      case 'teacher':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="add" size={24} color="#3b82f6" />
              <Text style={styles.actionTitle}>Create Quiz</Text>
              <Text style={styles.actionSubtitle}>Create a new quiz manually</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="bulb" size={24} color="#8b5cf6" />
              <Text style={styles.actionTitle}>AI Generate</Text>
              <Text style={styles.actionSubtitle}>Generate quiz with AI</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="bar-chart" size={24} color="#10b981" />
              <Text style={styles.actionTitle}>Analytics</Text>
              <Text style={styles.actionSubtitle}>View performance metrics</Text>
            </TouchableOpacity>
          </View>
        );

      case 'student':
        return (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="book" size={24} color="#3b82f6" />
              <Text style={styles.actionTitle}>Browse Quizzes</Text>
              <Text style={styles.actionSubtitle}>Find quizzes to take</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="trophy" size={24} color="#f59e0b" />
              <Text style={styles.actionTitle}>My Progress</Text>
              <Text style={styles.actionSubtitle}>View your results</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const onRefresh = () => {
    refetchAnalytics();
    refetchQuizzes();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={analyticsLoading || quizzesLoading} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.full_name}!
          </Text>
          <Text style={styles.subtitle}>
            Welcome to the AI Quiz System. Here's what's happening today.
          </Text>
        </View>

        {/* Stats Cards */}
        {getRoleBasedContent()}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {getQuickActions()}
        </View>

        {/* Recent Quizzes */}
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Quizzes</Text>
            <View style={styles.quizList}>
              {quizzesLoading ? (
                <Text style={styles.loadingText}>Loading quizzes...</Text>
              ) : quizzes && quizzes.length > 0 ? (
                quizzes.map((quiz: any) => (
                  <View key={quiz.id} style={styles.quizCard}>
                    <View style={styles.quizInfo}>
                      <Text style={styles.quizTitle}>{quiz.title}</Text>
                      <Text style={styles.quizMeta}>{quiz.subject} • {quiz.grade_level}</Text>
                    </View>
                    <View style={styles.quizStatus}>
                      <Text style={[
                        styles.statusText,
                        quiz.status === 'published' ? styles.statusPublished : styles.statusDraft
                      ]}>
                        {quiz.status}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No quizzes found</Text>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  quizList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  quizMeta: {
    fontSize: 14,
    color: '#6b7280',
  },
  quizStatus: {
    marginLeft: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPublished: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusDraft: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 20,
  },
});

export default DashboardScreen;
