import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';
import { Quiz, Question } from '../types';

const QuizDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { quizId } = route.params as { quizId: number };

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => apiService.getQuiz(quizId),
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => apiService.getQuizQuestions(quizId),
  });

  const handleTakeQuiz = () => {
    navigation.navigate('QuizTake' as never, { quizId } as never);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      draft: { backgroundColor: '#fef3c7', color: '#92400e' },
      published: { backgroundColor: '#dcfce7', color: '#166534' },
      archived: { backgroundColor: '#f3f4f6', color: '#374151' },
    };
    
    return (
      <View style={[styles.statusBadge, statusStyles[status as keyof typeof statusStyles]]}>
        <Text style={[styles.statusText, { color: statusStyles[status as keyof typeof statusStyles].color }]}>
          {status}
        </Text>
      </View>
    );
  };

  if (quizLoading || questionsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Quiz not found</Text>
        <Text style={styles.errorSubtitle}>The quiz you're looking for doesn't exist.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{quiz.title}</Text>
            <View style={styles.badges}>
              {quiz.is_ai_generated && (
                <Ionicons name="bulb" size={20} color="#8b5cf6" />
              )}
              {getStatusBadge(quiz.status)}
            </View>
          </View>
          <Text style={styles.subject}>{quiz.subject} • {quiz.grade_level}</Text>
        </View>

        {/* Quiz Info Cards */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Ionicons name="time" size={24} color="#3b82f6" />
            <Text style={styles.infoNumber}>{quiz.duration_minutes}</Text>
            <Text style={styles.infoLabel}>Minutes</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="book" size={24} color="#10b981" />
            <Text style={styles.infoNumber}>{questions?.length || 0}</Text>
            <Text style={styles.infoLabel}>Questions</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="people" size={24} color="#8b5cf6" />
            <Text style={styles.infoNumber}>{quiz.max_attempts}</Text>
            <Text style={styles.infoLabel}>Attempts</Text>
          </View>
          <View style={styles.infoCard}>
            <Ionicons name="trophy" size={24} color="#f59e0b" />
            <Text style={styles.infoNumber}>{quiz.passing_score}%</Text>
            <Text style={styles.infoLabel}>Passing</Text>
          </View>
        </View>

        {/* Description */}
        {quiz.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{quiz.description}</Text>
          </View>
        )}

        {/* Questions Preview */}
        {questions && questions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Questions Preview</Text>
            {questions.slice(0, 3).map((question: Question, index: number) => (
              <View key={question.id} style={styles.questionPreview}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionNumber}>Question {index + 1}</Text>
                  <View style={styles.questionBadges}>
                    <View style={styles.questionTypeBadge}>
                      <Text style={styles.questionTypeText}>
                        {question.question_type.replace('_', ' ')}
                      </Text>
                    </View>
                    <View style={styles.pointsBadge}>
                      <Text style={styles.pointsText}>{question.points} pt{question.points !== 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.questionText}>{question.question_text}</Text>
                {question.options && (
                  <View style={styles.optionsPreview}>
                    {question.options.map((option: string, optionIndex: number) => (
                      <Text key={optionIndex} style={styles.optionText}>
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
            {questions.length > 3 && (
              <Text style={styles.moreQuestions}>
                And {questions.length - 3} more question{questions.length - 3 !== 1 ? 's' : ''}...
              </Text>
            )}
          </View>
        )}

        {/* AI Generation Info */}
        {quiz.is_ai_generated && (
          <View style={styles.section}>
            <View style={styles.aiHeader}>
              <Ionicons name="bulb" size={20} color="#8b5cf6" />
              <Text style={styles.sectionTitle}>AI Generation Details</Text>
            </View>
            <View style={styles.aiInfo}>
              <Text style={styles.aiText}>
                This quiz was generated using AI technology. The questions and answers have been 
                automatically created based on the specified topic and difficulty level.
              </Text>
            </View>
          </View>
        )}

        {/* Take Quiz Button */}
        <TouchableOpacity style={styles.takeQuizButton} onPress={handleTakeQuiz}>
          <Ionicons name="play" size={20} color="#ffffff" />
          <Text style={styles.takeQuizButtonText}>Take Quiz</Text>
        </TouchableOpacity>
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subject: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  infoCard: {
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
  infoNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  questionPreview: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  questionBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  questionTypeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionTypeText: {
    fontSize: 12,
    color: '#374151',
  },
  pointsBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    color: '#1e40af',
  },
  questionText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  optionsPreview: {
    gap: 4,
  },
  optionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  moreQuestions: {
    textAlign: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  aiInfo: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
  },
  aiText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  takeQuizButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  takeQuizButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QuizDetailScreen;
