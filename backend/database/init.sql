-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

-- Students table (extends users)
CREATE TABLE students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    grade INTEGER CHECK (grade >= 1 AND grade <= 12),
    preferred_language VARCHAR(10) DEFAULT 'zh-TW',
    learning_style VARCHAR(20) DEFAULT 'visual',
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    mastered_concepts TEXT[], -- Array of concept IDs
    struggling_concepts TEXT[], -- Array of concept IDs
    last_assessment_date TIMESTAMP WITH TIME ZONE
);

-- Teachers table (extends users)
CREATE TABLE teachers (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    teacher_id VARCHAR(50) UNIQUE NOT NULL,
    subjects TEXT[] NOT NULL, -- Array of subjects
    teaching_experience INTEGER DEFAULT 0,
    bio TEXT
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_teachers_teacher_id ON teachers(teacher_id);

-- Insert some sample data for testing
INSERT INTO users (id, email, password_hash, name, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'teacher@test.com', '$2b$10$dummy.hash.for.testing', ',fY+', 'teacher'),
('22222222-2222-2222-2222-222222222222', 'student@test.com', '$2b$10$dummy.hash.for.testing', ',fx', 'student');

INSERT INTO teachers (id, teacher_id, subjects, teaching_experience) VALUES 
('11111111-1111-1111-1111-111111111111', 'T001', ARRAY['xx', 'i'], 5);

INSERT INTO students (id, student_id, grade) VALUES 
('22222222-2222-2222-2222-222222222222', 'S001', 10);