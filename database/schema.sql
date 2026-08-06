-- ==============================================================================
-- SCHEMA.SQL - Database Structure for EduTest AI (MySQL / PostgreSQL / SQLite)
-- Nền Tảng Thi Thử Online Tích Hợp AI & Anti-Cheat
-- ==============================================================================

-- 1. Bảng Nối / Danh mục Môn học (Subjects)
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) DEFAULT '📚',
    color VARCHAR(20) DEFAULT '#3b82f6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed 11 Môn học chuẩn
INSERT INTO subjects (id, name, icon, color) VALUES
('toan', 'Toán Học', '📐', '#3b82f6'),
('van', 'Ngữ Văn', '📚', '#ec4899'),
('anh', 'Tiếng Anh', '🌐', '#8b5cf6'),
('ly', 'Vật Lý', '⚡', '#f59e0b'),
('hoa', 'Hóa Học', '🧪', '#10b981'),
('sinh', 'Sinh Học', '🧬', '#06b6d4'),
('su', 'Lịch Sử', '🏛️', '#ef4444'),
('dia', 'Địa Lý', '🗺️', '#84cc16'),
('gdktpl', 'GDKT & PL', '⚖️', '#6366f1'),
('tin', 'Tin Học', '💻', '#0284c7'),
('congnghe', 'Công Nghệ', '⚙️', '#d97706')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Bảng Người dùng (Users: Student, Teacher, Admin)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('student', 'teacher', 'admin') DEFAULT 'student',
    grade VARCHAR(10) DEFAULT '12',
    subject_id VARCHAR(50),
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
);

-- Seed Tài khoản mẫu mặc định (mật khẩu: 123)
INSERT INTO users (id, username, password_hash, full_name, email, role, grade) VALUES
('usr_admin', 'admin', '123', 'Nguyễn Văn Admin', 'admin@edutest.edu.vn', 'admin', '12'),
('usr_teacher1', 'teacher', '123', 'Thầy Trần Hoàng Nam', 'nam.tran@edutest.edu.vn', 'teacher', '12'),
('usr_student1', 'student', '123', 'Lê Minh Khoa', 'khoa.le@gmail.com', 'student', '12'),
('usr_student2', 'student2', '123', 'Nguyễn Thu Hà', 'ha.nguyen@gmail.com', 'student', '12')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. Bảng Ngân hàng Câu hỏi (Questions)
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    subject_id VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    difficulty ENUM('nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao') DEFAULT 'thong_hieu',
    content TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_index INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
    explanation TEXT,
    image_url VARCHAR(255),
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Bảng Đề thi (Exams)
CREATE TABLE IF NOT EXISTS exams (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject_id VARCHAR(50) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    total_questions INT NOT NULL DEFAULT 0,
    created_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Bảng Chi tiết Câu hỏi trong Đề thi (Exam Questions Mapping)
CREATE TABLE IF NOT EXISTS exam_questions (
    exam_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    question_order INT NOT NULL,
    PRIMARY KEY (exam_id, question_id),
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 6. Bảng Kết quả Thi thử Học sinh (Student Exam Results)
CREATE TABLE IF NOT EXISTS student_exams (
    id VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    exam_id VARCHAR(50) NOT NULL,
    score DECIMAL(4,1) NOT NULL,
    correct_count INT NOT NULL,
    wrong_count INT NOT NULL,
    unanswered_count INT NOT NULL,
    accuracy INT NOT NULL,
    time_spent_seconds INT NOT NULL,
    violations_count INT DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- 7. Bảng Chi tiết Đáp án của Thí sinh (Student Answers)
CREATE TABLE IF NOT EXISTS student_answers (
    student_exam_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    selected_index INT,
    is_correct BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_exam_id, question_id),
    FOREIGN KEY (student_exam_id) REFERENCES student_exams(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 8. Bảng Huy hiệu Thành tích Học sinh (User Badges)
CREATE TABLE IF NOT EXISTS user_badges (
    user_id VARCHAR(50) NOT NULL,
    badge_code VARCHAR(50) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, badge_code),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tối ưu hóa Chỉ mục (Indexes) cho truy vấn tức thì
CREATE INDEX idx_questions_subject_grade ON questions(subject_id, grade);
CREATE INDEX idx_student_exams_student ON student_exams(student_id);
CREATE INDEX idx_student_exams_exam ON student_exams(exam_id);
