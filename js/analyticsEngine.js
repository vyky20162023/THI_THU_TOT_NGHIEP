/**
 * ANALYTICS_ENGINE.JS - Result Calculation & Dashboard Stats
 * Chấm điểm tự động, tính độ chính xác, thống kê bảng điều khiển & cấp huy hiệu
 */

const AnalyticsEngine = {
  // Tính toán kết quả nộp bài ngay tức thì
  calculateResult(exam, questions, userAnswers, timeSpentSeconds, violationsCount) {
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    questions.forEach(q => {
      const selected = userAnswers[q.id];
      if (selected === undefined || selected === null) {
        unansweredCount++;
      } else if (selected === q.correctIndex) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? parseFloat(((correctCount / totalQuestions) * 10).toFixed(1)) : 0;
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const currentUser = Auth.getCurrentUser();

    return {
      id: "se_" + Date.now(),
      studentId: currentUser ? currentUser.id : "guest",
      studentName: currentUser ? currentUser.fullName : "Học sinh Ẩn danh",
      examId: exam.id,
      examTitle: exam.title,
      subjectId: exam.subjectId,
      score: score,
      correctCount: correctCount,
      wrongCount: wrongCount,
      unansweredCount: unansweredCount,
      accuracy: accuracy,
      timeSpentSeconds: timeSpentSeconds,
      userAnswers: userAnswers,
      violationsCount: violationsCount,
      submittedAt: new Date().toISOString()
    };
  },

  // Đánh giá thành tích & cấp Huy hiệu mới cho học sinh
  checkBadgesAndUpdateUser(result) {
    const user = Auth.getCurrentUser();
    if (!user || user.role !== "student") return;

    const currentBadges = user.badges || [];
    const newBadges = [...currentBadges];

    // Badge 1: Khởi đầu may mắn (B1)
    if (!newBadges.includes("b1")) newBadges.push("b1");

    // Badge 2: Thủ khoa tương lai (Điểm >= 9.0)
    if (result.score >= 9.0 && !newBadges.includes("b2")) newBadges.push("b2");

    // Badge 3: Thần tốc (Điểm > 8, thời gian làm < 50% thời gian cho phép)
    if (result.score >= 8.0 && result.timeSpentSeconds < (45 * 60) / 2 && !newBadges.includes("b3")) {
      if (!newBadges.includes("b3")) newBadges.push("b3");
    }

    // Badge 4: Điểm 10 Tuyệt đối
    if (result.score === 10.0 && !newBadges.includes("b4")) newBadges.push("b4");

    // Badge 5: Chăm chỉ (Làm trên 10 bài thi)
    const studentExams = Store.getItem(CONFIG.STORAGE_KEYS.STUDENT_EXAMS) || [];
    const myExams = studentExams.filter(e => e.studentId === user.id);
    if (myExams.length >= 10 && !newBadges.includes("b5")) newBadges.push("b5");

    // Cập nhật lại user
    Auth.updateProfile({ badges: newBadges });
  },

  // Tổng hợp dữ liệu thống kê Bảng điều khiển (Dashboard Stats)
  getDashboardStats() {
    const users = Store.getItem(CONFIG.STORAGE_KEYS.USERS) || [];
    const studentExams = Store.getItem(CONFIG.STORAGE_KEYS.STUDENT_EXAMS) || [];
    const exams = Store.getItem(CONFIG.STORAGE_KEYS.EXAMS) || [];
    const questions = Store.getItem(CONFIG.STORAGE_KEYS.QUESTIONS) || [];

    const students = users.filter(u => u.role === "student");
    const teachers = users.filter(u => u.role === "teacher");

    const totalStudentsCount = students.length;
    const totalExamsCount = studentExams.length;

    // Tính điểm trung bình toàn hệ thống
    const sumScores = studentExams.reduce((sum, e) => sum + e.score, 0);
    const avgScore = totalExamsCount > 0 ? (sumScores / totalExamsCount).toFixed(1) : "0.0";

    // Xếp hạng Top Học Sinh (dựa trên điểm trung bình & số bài làm)
    const studentStatsMap = {};
    studentExams.forEach(e => {
      if (!studentStatsMap[e.studentId]) {
        studentStatsMap[e.studentId] = {
          studentId: e.studentId,
          name: e.studentName || "Học sinh",
          totalExams: 0,
          sumScores: 0,
          maxScore: 0
        };
      }
      studentStatsMap[e.studentId].totalExams++;
      studentStatsMap[e.studentId].sumScores += e.score;
      if (e.score > studentStatsMap[e.studentId].maxScore) {
        studentStatsMap[e.studentId].maxScore = e.score;
      }
    });

    const topStudents = Object.values(studentStatsMap)
      .map(s => ({
        ...s,
        avgScore: (s.sumScores / s.totalExams).toFixed(1)
      }))
      .sort((a, b) => b.avgScore - a.avgScore || b.totalExams - a.totalExams)
      .slice(0, 5);

    return {
      totalStudentsCount,
      totalTeachersCount: teachers.length,
      totalExamsCount,
      totalQuestionBankCount: questions.length,
      publishedExamsCount: exams.length,
      avgScore,
      topStudents
    };
  }
};
