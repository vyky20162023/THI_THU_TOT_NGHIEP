/**
 * CONFIG.JS - Application Constants & Configuration
 * Nền tảng Thi Thử Online Tích Hợp AI & Anti-Cheat
 */

const CONFIG = {
  APP_NAME: "EduTest AI - Nền Tảng Thi Thử Thông Minh",
  VERSION: "2.0.0",

  // Danh mục 11 Môn học chuẩn bộ GD&ĐT (Toán, Văn, Anh, Lý, Hoá, Sinh, Sử, Địa, GDKTPL, Tin, Công nghệ)
  SUBJECTS: [
    { id: "toan", name: "Toán Học", icon: "📐", color: "#3b82f6" },
    { id: "van", name: "Ngữ Văn", icon: "📚", color: "#ec4899" },
    { id: "anh", name: "Tiếng Anh", icon: "🌐", color: "#8b5cf6" },
    { id: "ly", name: "Vật Lý", icon: "⚡", color: "#f59e0b" },
    { id: "hoa", name: "Hóa Học", icon: "🧪", color: "#10b981" },
    { id: "sinh", name: "Sinh Học", icon: "🧬", color: "#06b6d4" },
    { id: "su", name: "Lịch Sử", icon: "🏛️", color: "#ef4444" },
    { id: "dia", name: "Địa Lý", icon: "🗺️", color: "#84cc16" },
    { id: "gdktpl", name: "GDKT & PL", icon: "⚖️", color: "#6366f1" },
    { id: "tin", name: "Tin Học", icon: "💻", color: "#0284c7" },
    { id: "congnghe", name: "Công Nghệ", icon: "⚙️", color: "#d97706" },
  ],

  // Các khối lớp
  GRADES: [
    { id: "10", name: "Lớp 10" },
    { id: "11", name: "Lớp 11" },
    { id: "12", name: "Lớp 12" },
  ],

  // Mức độ câu hỏi
  DIFFICULTIES: [
    { id: "nhan_biet", name: "Nhận biết", level: 1, color: "#10b981" },
    { id: "thong_hieu", name: "Thông hiểu", level: 2, color: "#3b82f6" },
    { id: "van_dung", name: "Vận dụng", level: 3, color: "#f59e0b" },
    { id: "van_dung_cao", name: "Vận dụng cao", level: 4, color: "#ef4444" },
  ],

  // Danh mục Huy hiệu thành tích (Gamification Badges)
  BADGES: [
    { id: "b1", code: "FIRST_EXAM", name: "Khởi Đầu May Mắn", desc: "Hoàn thành bài thi đầu tiên", icon: "🎖️" },
    { id: "b2", code: "SCORE_9", name: "Thủ Khoa Tương Lai", desc: "Đạt điểm từ 9.0 trở lên", icon: "🏆" },
    { id: "b3", code: "SPEED_RUN", name: "Thần Tốc", desc: "Hoàn thành bài thi dưới 50% thời gian với điểm > 8", icon: "⚡" },
    { id: "b4", code: "PERFECT_10", name: "Điểm 10 Tuyệt Đối", desc: "Đạt 10/10 điểm bài thi chính thức", icon: "🌟" },
    { id: "b5", code: "HARD_WORKING", name: "Chăm Chỉ", desc: "Làm trên 10 bài thi thử", icon: "🔥" },
    { id: "b6", code: "AI_EXPLORER", name: "Khám Phá AI", desc: "Sử dụng AI Tutor để giải thích câu hỏi", icon: "🤖" },
  ],

  // Cấu hình Anti-Cheat
  ANTI_CHEAT: {
    MAX_TAB_VIOLATIONS: 3,
    AUTO_SUBMIT_ON_BREACH: true,
    LOCK_COPY_PASTE: true,
    REQUIRE_FULLSCREEN: true,
  },

  // Cấu hình lưu trữ LocalStorage
  STORAGE_KEYS: {
    USERS: "edutest_users",
    CURRENT_USER: "edutest_current_user",
    EXAMS: "edutest_exams",
    QUESTIONS: "edutest_questions",
    STUDENT_EXAMS: "edutest_student_exams",
    ACTIVE_SESSION: "edutest_active_session",
    SETTINGS: "edutest_settings",
  }
};
