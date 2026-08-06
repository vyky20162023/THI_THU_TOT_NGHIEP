/**
 * EXAM_ENGINE.JS - Real-Time Exam Taking Engine
 * Đồng hồ đếm ngược, Auto-Save, Resume bài thi dở dang & Quản lý làm bài
 */

const ExamEngine = {
  currentExam: null,
  questions: [],
  userAnswers: {}, // { questionId: selectedIndex }
  flaggedQuestions: {}, // { questionId: true/false }
  timeRemainingSeconds: 0,
  timerInterval: null,
  autoSaveInterval: null,
  activeQuestionIndex: 0,

  // Khởi động bài thi mới hoặc tiếp tục bài thi dở dang
  startExam(exam, resumeSession = null) {
    this.currentExam = exam;
    
    // Lấy danh sách câu hỏi từ Store
    const allQuestions = Store.getItem(CONFIG.STORAGE_KEYS.QUESTIONS) || [];
    this.questions = exam.questionIds.map(qid => allQuestions.find(q => q.id === qid)).filter(Boolean);

    if (resumeSession) {
      // Phục hồi từ Session dở dang
      this.userAnswers = resumeSession.userAnswers || {};
      this.flaggedQuestions = resumeSession.flaggedQuestions || {};
      this.timeRemainingSeconds = resumeSession.timeRemainingSeconds;
      this.activeQuestionIndex = resumeSession.activeQuestionIndex || 0;
      console.log("🔄 Resumed unfinished exam session!");
    } else {
      // Bắt đầu bài thi mới
      this.userAnswers = {};
      this.flaggedQuestions = {};
      this.timeRemainingSeconds = exam.durationMinutes * 60;
      this.activeQuestionIndex = 0;
    }

    // Kích hoạt Anti-Cheat Engine
    AntiCheatEngine.start(
      (count, max, reason) => {
        this.saveActiveSession();
        // Event callback khi vi phạm
        if (window.renderExamUI) window.renderExamUI();
      },
      () => {
        // Tự động nộp bài khi vi phạm quá số lần
        this.submitExam("VIOLATION_LIMIT_EXCEEDED");
      }
    );

    // Kích hoạt Countdown Timer
    this.startTimer();

    // Kích hoạt Auto-Save mỗi 5 giây
    this.startAutoSave();

    // Lưu session lần đầu
    this.saveActiveSession();
  },

  // Khởi động đồng hồ đếm ngược
  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeRemainingSeconds--;

      if (window.updateTimerUI) {
        window.updateTimerUI(this.timeRemainingSeconds);
      }

      // Hết giờ thi -> Tự động nộp bài
      if (this.timeRemainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.submitExam("TIME_EXPIRED");
      }
    }, 1000);
  },

  // Khởi động cơ chế Auto-Save
  startAutoSave() {
    clearInterval(this.autoSaveInterval);
    this.autoSaveInterval = setInterval(() => {
      this.saveActiveSession();
    }, 5000);
  },

  // Lưu trạng thái phiên làm bài hiện tại vào LocalStorage
  saveActiveSession() {
    if (!this.currentExam) return;

    const currentUser = Auth.getCurrentUser();
    const sessionData = {
      studentId: currentUser ? currentUser.id : "guest",
      examId: this.currentExam.id,
      userAnswers: this.userAnswers,
      flaggedQuestions: this.flaggedQuestions,
      timeRemainingSeconds: this.timeRemainingSeconds,
      activeQuestionIndex: this.activeQuestionIndex,
      violationsCount: AntiCheatEngine.violationsCount,
      lastSavedAt: new Date().toISOString()
    };

    Store.setItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION, sessionData);
  },

  // Đặt câu trả lời cho câu hỏi
  selectAnswer(questionId, optionIndex) {
    this.userAnswers[questionId] = optionIndex;
    this.saveActiveSession();
  },

  // Đánh dấu / Bỏ đánh dấu câu hỏi (Bookmark/Flag)
  toggleFlag(questionId) {
    this.flaggedQuestions[questionId] = !this.flaggedQuestions[questionId];
    this.saveActiveSession();
  },

  // Kiểm tra phiên làm bài dở dang
  checkUnfinishedSession(examId) {
    const session = Store.getItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION);
    if (session && session.examId === examId && session.timeRemainingSeconds > 0) {
      return session;
    }
    return null;
  },

  // Nộp bài thi & Chấm điểm tức thì
  submitExam(reason = "MANUAL_SUBMIT") {
    clearInterval(this.timerInterval);
    clearInterval(this.autoSaveInterval);
    AntiCheatEngine.stop();

    // Xóa session làm bài dở dang
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION);

    // Tính toán kết quả thi
    const result = AnalyticsEngine.calculateResult(
      this.currentExam,
      this.questions,
      this.userAnswers,
      this.currentExam.durationMinutes * 60 - this.timeRemainingSeconds,
      AntiCheatEngine.violationsCount
    );

    // Lưu kết quả vào DB
    const studentExams = Store.getItem(CONFIG.STORAGE_KEYS.STUDENT_EXAMS) || [];
    studentExams.unshift(result);
    Store.setItem(CONFIG.STORAGE_KEYS.STUDENT_EXAMS, studentExams);

    // Kiểm tra & Mở khóa Huy hiệu (Gamification Badges)
    AnalyticsEngine.checkBadgesAndUpdateUser(result);

    // Chuyển sang màn hình kết quả
    if (window.showResultView) {
      window.showResultView(result);
    }

    return result;
  }
};
