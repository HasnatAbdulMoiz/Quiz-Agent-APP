import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';
import { Quiz, Question, AnswerCreate } from '../types';

const QuizTakeScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { quizId } = route.params as { quizId: number };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [quizStartTime] = useState(Date.now());
  const [timeRemaining, setTimeRemaining] = useState(0);

  const { data: quiz, isLoading: quizLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => apiService.getQuiz(quizId),
  });

  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => apiService.getQuizQuestions(quizId),
  });

  const submitQuizMutation = useMutation({
    mutationFn: (answersData: AnswerCreate[]) => apiService.takeQuiz(quizId, answersData),
    onSuccess: (result) => {
      Alert.alert(
        'Quiz Completed!',
        `Your score: ${result.percentage.toFixed(1)}%`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      queryClient.invalidateQueries({ queryKey: ['quiz-results'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    },
  });

  // Timer effect
  useEffect(() => {
    if (!quiz) return;

    const duration = quiz.duration_minutes * 60 * 1000;
    setTimeRemaining(duration);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1000) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz]);

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

    const answersData: AnswerCreate[] = questions.map((question: Question) => ({
      question_id: question.id,
      answer_text: answers[question.id] || '',
      time_spent: Math.round((timeSpent[question.id] || 0) / 1000),
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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (!quiz || !questions || questions.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorTitle}>Quiz not found</Text>
        <Text style={styles.errorSubtitle}>The quiz you're looking for doesn't exist or has no questions.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <View style={styles.timerContainer}>
            <Ionicons name="time" size={20} color="#ef4444" />
            <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${getProgress()}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>
      </View>

      {/* Question */}
      <ScrollView style={styles.content}>
        {currentQuestion && (
          <View style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionTitle}>
                Question {currentQuestionIndex + 1}
              </Text>
              <View style={styles.questionBadges}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>
                    {currentQuestion.question_type.replace('_', ' ')}
                  </Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>
                    {currentQuestion.points} pt{currentQuestion.points !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.questionText}>{currentQuestion.question_text}</Text>

            {/* Answer Options */}
            <View style={styles.answersContainer}>
              {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                currentQuestion.options.map((option: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.answerOption,
                      answers[currentQuestion.id] === option && styles.answerOptionSelected
                    ]}
                    onPress={() => handleAnswerChange(currentQuestion.id, option)}
                  >
                    <View style={styles.optionContent}>
                      {answers[currentQuestion.id] === option ? (
                        <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                      ) : (
                        <Ionicons name="ellipse-outline" size={20} color="#9ca3af" />
                      )}
                      <Text style={[
                        styles.optionText,
                        answers[currentQuestion.id] === option && styles.optionTextSelected
                      ]}>
                        {option}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}

              {currentQuestion.question_type === 'true_false' && (
                <View style={styles.trueFalseContainer}>
                  {['True', 'False'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.answerOption,
                        answers[currentQuestion.id] === option && styles.answerOptionSelected
                      ]}
                      onPress={() => handleAnswerChange(currentQuestion.id, option)}
                    >
                      <View style={styles.optionContent}>
                        {answers[currentQuestion.id] === option ? (
                          <Ionicons name="checkmark-circle" size={20} color="#3b82f6" />
                        ) : (
                          <Ionicons name="ellipse-outline" size={20} color="#9ca3af" />
                        )}
                        <Text style={[
                          styles.optionText,
                          answers[currentQuestion.id] === option && styles.optionTextSelected
                        ]}>
                          {option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {(currentQuestion.question_type === 'short_answer' || currentQuestion.question_type === 'essay') && (
                <TextInput
                  style={styles.textInput}
                  value={answers[currentQuestion.id] || ''}
                  onChangeText={(text) => handleAnswerChange(currentQuestion.id, text)}
                  placeholder={`Enter your ${currentQuestion.question_type === 'essay' ? 'essay' : 'answer'} here...`}
                  multiline={currentQuestion.question_type === 'essay'}
                  numberOfLines={currentQuestion.question_type === 'essay' ? 6 : 3}
                  textAlignVertical="top"
                />
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, isFirstQuestion && styles.navButtonDisabled]}
          onPress={handlePreviousQuestion}
          disabled={isFirstQuestion}
        >
          <Ionicons name="chevron-back" size={20} color={isFirstQuestion ? "#9ca3af" : "#374151"} />
          <Text style={[styles.navButtonText, isFirstQuestion && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.questionDots}>
          {questions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                index === currentQuestionIndex && styles.dotActive,
                answers[questions[index].id] && styles.dotAnswered
              ]}
              onPress={() => setCurrentQuestionIndex(index)}
            />
          ))}
        </View>

        {isLastQuestion ? (
          <TouchableOpacity
            style={[styles.navButton, styles.submitButton]}
            onPress={handleSubmitQuiz}
            disabled={submitQuizMutation.isPending}
          >
            <Text style={styles.submitButtonText}>
              {submitQuizMutation.isPending ? 'Submitting...' : 'Submit'}
            </Text>
            <Ionicons name="checkmark" size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleNextQuestion}>
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color="#374151" />
          </TouchableOpacity>
        )}
      </View>

      {/* Time Warning */}
      {timeRemaining <= 5 * 60 * 1000 && timeRemaining > 0 && (
        <View style={styles.timeWarning}>
          <Ionicons name="warning" size={20} color="#f59e0b" />
          <Text style={styles.timeWarningText}>
            Warning: You have {formatTime(timeRemaining)} remaining!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  questionContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  questionBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
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
    lineHeight: 24,
    marginBottom: 20,
  },
  answersContainer: {
    gap: 12,
  },
  answerOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
  },
  answerOptionSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    color: '#1e40af',
    fontWeight: '500',
  },
  trueFalseContainer: {
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#ffffff',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  navButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  navButtonTextDisabled: {
    color: '#9ca3af',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  questionDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    backgroundColor: '#3b82f6',
  },
  dotAnswered: {
    backgroundColor: '#10b981',
  },
  timeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f59e0b',
  },
  timeWarningText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
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

export default QuizTakeScreen;
