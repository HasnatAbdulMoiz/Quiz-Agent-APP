import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        
        const message = error.response?.data?.detail || error.message || 'An error occurred';
        toast.error(message);
        
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.api.post('/auth/login', { username, password });
    return response.data;
  }

  async register(userData: any) {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // User endpoints
  async getUsers(skip = 0, limit = 100) {
    const response = await this.api.get(`/users?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getUser(userId: number) {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  // Quiz endpoints
  async getQuizzes(skip = 0, limit = 100) {
    const response = await this.api.get(`/quizzes?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getQuiz(quizId: number) {
    const response = await this.api.get(`/quizzes/${quizId}`);
    return response.data;
  }

  async createQuiz(quizData: any) {
    const response = await this.api.post('/quizzes', quizData);
    return response.data;
  }

  async updateQuiz(quizId: number, quizData: any) {
    const response = await this.api.put(`/quizzes/${quizId}`, quizData);
    return response.data;
  }

  async deleteQuiz(quizId: number) {
    const response = await this.api.delete(`/quizzes/${quizId}`);
    return response.data;
  }

  // Question endpoints
  async getQuizQuestions(quizId: number) {
    const response = await this.api.get(`/quizzes/${quizId}/questions`);
    return response.data;
  }

  async createQuestion(quizId: number, questionData: any) {
    const response = await this.api.post(`/quizzes/${quizId}/questions`, questionData);
    return response.data;
  }

  // AI Generation
  async generateQuizWithAI(request: any) {
    const response = await this.api.post('/ai/generate-quiz', request);
    return response.data;
  }

  // Quiz taking
  async takeQuiz(quizId: number, answers: any[]) {
    const response = await this.api.post(`/quizzes/${quizId}/take`, answers);
    return response.data;
  }

  // Analytics
  async getAnalytics() {
    const response = await this.api.get('/analytics');
    return response.data;
  }

  // Health check
  async healthCheck() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
