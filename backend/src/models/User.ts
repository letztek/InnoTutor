import { getPool } from '../database/connection';
import bcrypt from 'bcryptjs';
import { User, Student, Teacher } from '../types';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<User | null> {
    const pool = getPool();
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND is_active = true',
      [id]
    );
    
    return result.rows[0] || null;
  }

  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'teacher';
  }): Promise<User> {
    const pool = getPool();
    const { email, password, name, role } = userData;
    
    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [email, passwordHash, name, role]
    );
    
    return result.rows[0];
  }

  static async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateLastLogin(userId: string): Promise<void> {
    const pool = getPool();
    await pool.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
  }

  static async createStudent(userId: string, studentData: {
    studentId: string;
    grade?: number;
    preferredLanguage?: string;
    learningStyle?: string;
    difficultyLevel?: number;
  }): Promise<void> {
    const pool = getPool();
    const { 
      studentId, 
      grade = 1, 
      preferredLanguage = 'zh-TW',
      learningStyle = 'visual',
      difficultyLevel = 1 
    } = studentData;
    
    await pool.query(
      `INSERT INTO students (id, student_id, grade, preferred_language, learning_style, difficulty_level)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, studentId, grade, preferredLanguage, learningStyle, difficultyLevel]
    );
  }

  static async createTeacher(userId: string, teacherData: {
    teacherId: string;
    subjects: string[];
    teachingExperience?: number;
    bio?: string;
  }): Promise<void> {
    const pool = getPool();
    const { teacherId, subjects, teachingExperience = 0, bio } = teacherData;
    
    await pool.query(
      `INSERT INTO teachers (id, teacher_id, subjects, teaching_experience, bio)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, teacherId, subjects, teachingExperience, bio]
    );
  }

  static async getStudentProfile(userId: string): Promise<Student | null> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT u.*, s.student_id, s.grade, s.preferred_language, s.learning_style,
              s.difficulty_level, s.mastered_concepts, s.struggling_concepts, s.last_assessment_date
       FROM users u
       JOIN students s ON u.id = s.id
       WHERE u.id = $1 AND u.is_active = true`,
      [userId]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      learningPreferences: {
        preferredLanguage: row.preferred_language,
        learningStyle: row.learning_style,
        difficultyLevel: row.difficulty_level
      },
      knowledgeState: {
        masteredConcepts: row.mastered_concepts || [],
        strugglingConcepts: row.struggling_concepts || [],
        lastAssessmentDate: row.last_assessment_date
      },
      classes: [] // TODO: Load from student_classes table
    };
  }

  static async getTeacherProfile(userId: string): Promise<Teacher | null> {
    const pool = getPool();
    const result = await pool.query(
      `SELECT u.*, t.teacher_id, t.subjects, t.teaching_experience, t.bio
       FROM users u
       JOIN teachers t ON u.id = t.id
       WHERE u.id = $1 AND u.is_active = true`,
      [userId]
    );
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      teachingExperience: row.teaching_experience,
      classes: [] // TODO: Load from classes table
    };
  }

  static async emailExists(email: string): Promise<boolean> {
    const pool = getPool();
    const result = await pool.query(
      'SELECT 1 FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0;
  }

  static async generateUniqueStudentId(): Promise<string> {
    const pool = getPool();
    let studentId: string;
    let attempts = 0;
    
    do {
      // Generate student ID: S + year + random 4-digit number
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      studentId = `S${year}${randomNum}`;
      
      const result = await pool.query(
        'SELECT 1 FROM students WHERE student_id = $1',
        [studentId]
      );
      
      if (result.rows.length === 0) break;
      attempts++;
    } while (attempts < 10);
    
    return studentId;
  }

  static async generateUniqueTeacherId(): Promise<string> {
    const pool = getPool();
    let teacherId: string;
    let attempts = 0;
    
    do {
      // Generate teacher ID: T + year + random 4-digit number
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      teacherId = `T${year}${randomNum}`;
      
      const result = await pool.query(
        'SELECT 1 FROM teachers WHERE teacher_id = $1',
        [teacherId]
      );
      
      if (result.rows.length === 0) break;
      attempts++;
    } while (attempts < 10);
    
    return teacherId;
  }
}