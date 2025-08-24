import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'teacher';
  grade?: number;
  subjects?: string[];
  teachingExperience?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', credentials);
      const { data } = response.data;
      
      // Store token
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '登入失敗');
    }
  }

  static async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/register', registerData);
      const { data } = response.data;
      
      // Store token
      localStorage.setItem('token', data.token);
      
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '註冊失敗');
    }
  }

  static async logout(): Promise<void> {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  }

  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/api/auth/me');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || '無法取得用戶資訊');
    }
  }

  static async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;

      const response = await api.post('/api/auth/validate', { token });
      return response.data.data.valid;
    } catch (error) {
      return false;
    }
  }

  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}