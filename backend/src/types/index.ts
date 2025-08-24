// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  createdAt: Date;
  lastLoginAt: Date;
}

export interface Student extends User {
  studentId: string;
  grade: number;
  classes: string[];
  learningPreferences: LearningPreferences;
  knowledgeState: KnowledgeState;
}

export interface Teacher extends User {
  teacherId: string;
  subjects: string[];
  classes: string[];
  teachingExperience: number;
}

export interface LearningPreferences {
  preferredLanguage: 'zh-TW' | 'en-US';
  learningStyle: 'visual' | 'auditory' | 'kinesthetic';
  difficultyLevel: number;
}

export interface KnowledgeState {
  masteredConcepts: string[];
  strugglingConcepts: string[];
  lastAssessmentDate: Date;
}

// Dialogue Types
export interface DialogueSession {
  id: string;
  studentId: string;
  problemImage: string;
  problemAnalysis: ProblemAnalysis;
  steps: DialogueStep[];
  currentStepIndex: number;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
}

export interface DialogueStep {
  id: string;
  stepNumber: number;
  question: string;
  studentResponse?: string;
  aiEvaluation?: string;
  hints: Hint[];
  skipped: boolean;
  completedAt?: Date;
}

export interface ProblemAnalysis {
  subject: string;
  difficulty: number;
  concepts: string[];
  steps: ProblemStep[];
  visualElements: VisualElement[];
}

export interface ProblemStep {
  id: string;
  description: string;
  expectedConcepts: string[];
  hints: string[];
}

export interface VisualElement {
  type: 'diagram' | 'equation' | 'graph' | 'table';
  description: string;
  coordinates?: { x: number; y: number; width: number; height: number };
}

export interface Hint {
  id: string;
  content: string;
  level: 'gentle' | 'moderate' | 'strong';
  revealed: boolean;
}

// Learning Path Types
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  subject: string;
  difficulty: number;
  stages: LearningStage[];
  prerequisites: string[];
  estimatedDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningStage {
  id: string;
  title: string;
  description: string;
  content: Content;
  questions: Question[];
  unlockThreshold: number;
  maxScore: number;
  order: number;
}

export interface Content {
  type: 'text' | 'video' | 'image' | 'interactive';
  data: string;
  metadata?: Record<string, any>;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'code';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

// Assessment Types
export interface Assessment {
  id: string;
  studentId: string;
  questionId: string;
  answer: string;
  submittedAt: Date;
  gradingResult?: GradingResult;
}

export interface GradingResult {
  score: number; // 0-3分
  similarity: number; // 相似度百分比
  conceptsCovered: string[];
  missedConcepts: string[];
  feedback: string;
  referenceAnswer: string;
  improvementAreas: string[];
}

// Collaboration Types
export interface Room {
  id: string;
  topic: string;
  participants: Participant[];
  messages: Message[];
  aiModerator: AIModerator;
  status: RoomStatus;
  createdAt: Date;
}

export interface Participant {
  userId: string;
  name: string;
  role: 'student' | 'teacher';
  joinedAt: Date;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  timestamp: Date;
}

export interface AIModerator {
  isActive: boolean;
  guidelines: string[];
  interventionTriggers: string[];
}

export type RoomStatus = 'active' | 'closed' | 'archived';

// Analytics Types
export interface PersonalReport {
  studentId: string;
  practiceFrequency: FrequencyData;
  accuracyRate: AccuracyData;
  timeDistribution: TimeData;
  knowledgeGaps: KnowledgeGap[];
  recommendations: Recommendation[];
}

export interface FrequencyData {
  daily: number[];
  weekly: number[];
  monthly: number[];
}

export interface AccuracyData {
  overall: number;
  bySubject: Record<string, number>;
  byDifficulty: Record<string, number>;
}

export interface TimeData {
  totalMinutes: number;
  averageSessionLength: number;
  peakHours: number[];
}

export interface KnowledgeGap {
  concept: string;
  subject: string;
  severity: 'low' | 'medium' | 'high';
  recommendedActions: string[];
}

export interface Recommendation {
  type: 'study-plan' | 'concept-review' | 'practice-more';
  title: string;
  description: string;
  priority: number;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error Types
export enum ErrorCodes {
  // 系統錯誤 (1xxx)
  SYSTEM_UNAVAILABLE = '1001',
  DATABASE_ERROR = '1002',
  AI_SERVICE_TIMEOUT = '1003',
  
  // 認證錯誤 (2xxx)
  UNAUTHORIZED = '2001',
  TOKEN_EXPIRED = '2002',
  INSUFFICIENT_PERMISSIONS = '2003',
  
  // 業務邏輯錯誤 (3xxx)
  INVALID_LEARNING_PATH = '3001',
  PREREQUISITE_NOT_MET = '3002',
  ASSESSMENT_ERROR = '3003',
  
  // 用戶輸入錯誤 (4xxx)
  INVALID_INPUT = '4001',
  MISSING_REQUIRED_FIELD = '4002',
  FILE_TOO_LARGE = '4003'
}