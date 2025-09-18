import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://your-backend-url.vercel.app'; // Replace with your actual backend URL

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
      async (config) => {
        const token = await SecureStore.getItemAsync('access_token');
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
      async (error) => {
        if (error.response?.status === 401) {
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('user');
          // Navigate to login screen
        }
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

  // Quiz endpoints
  async getQuizzes(skip = 0, limit = 100) {
    const response = await this.api.get(`/quizzes?skip=${skip}&limit=${limit}`);
    return response.data;
  }

  async getQuiz(quizId: number) {
    const response = await this.api.get(`/quizzes/${quizId}`);
    return response.data;
  }

  async getQuizQuestions(quizId: number) {
    const response = await this.api.get(`/quizzes/${quizId}/questions`);
    return response.data;
  }

  async takeQuiz(quizId: number, answers: any[]) {
    const response = await this.api.post(`/quizzes/${quizId}/take`, answers);
    return response.data;
  }

  // AI Generation
  async generateQuizWithAI(request: any) {
    const response = await this.api.post('/ai/generate-quiz', request);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
