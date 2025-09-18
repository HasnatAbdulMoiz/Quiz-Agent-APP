import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';
import { Quiz } from '../types';

const QuizListScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();

  const { data: quizzes, isLoading, refetch } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => apiService.getQuizzes(),
  });

  const filteredQuizzes = quizzes?.filter((quiz: Quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.subject.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const renderQuizItem = ({ item }: { item: Quiz }) => (
    <TouchableOpacity
      style={styles.quizCard}
      onPress={() => navigation.navigate('QuizDetail' as never, { quizId: item.id } as never)}
    >
      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle}>{item.title}</Text>
        <View style={styles.quizBadges}>
          {item.is_ai_generated && (
            <Ionicons name="bulb" size={16} color="#8b5cf6" />
          )}
          <View style={[
            styles.statusBadge,
            item.status === 'published' ? styles.statusPublished : styles.statusDraft
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'published' ? styles.statusTextPublished : styles.statusTextDraft
            ]}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.quizSubject}>{item.subject}</Text>
      <Text style={styles.quizGrade}>{item.grade_level}</Text>
      
      {item.description && (
        <Text style={styles.quizDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.quizMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="time" size={16} color="#6b7280" />
          <Text style={styles.metaText}>{item.duration_minutes} min</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text style={styles.metaText}>{item.max_attempts} attempt{item.max_attempts !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <View style={styles.quizFooter}>
        <Text style={styles.quizDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <TouchableOpacity style={styles.takeButton}>
          <Text style={styles.takeButtonText}>Take Quiz</Text>
          <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quizzes</Text>
        <Text style={styles.subtitle}>Browse available quizzes</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search quizzes..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quizzes...</Text>
        </View>
      ) : filteredQuizzes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="book" size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No quizzes found</Text>
          <Text style={styles.emptySubtitle}>
            {searchTerm ? 'Try adjusting your search' : 'No quizzes available at the moment'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredQuizzes}
          renderItem={renderQuizItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          showsVerticalScrollIndicator={false}
        />
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
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  quizCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  quizBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPublished: {
    backgroundColor: '#dcfce7',
  },
  statusDraft: {
    backgroundColor: '#fef3c7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextPublished: {
    color: '#166534',
  },
  statusTextDraft: {
    color: '#92400e',
  },
  quizSubject: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  quizGrade: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  quizMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
  },
  quizFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  takeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default QuizListScreen;
