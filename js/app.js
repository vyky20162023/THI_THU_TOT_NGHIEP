/**
 * APP.JS - Main Application Orchestrator & View Controller
 * Nền tảng Thi Thử Online Đa Vai Trò Tích Hợp AI & Anti-Cheat
 */

const App = {
  currentView: "home",
  selectedSubject: "all",
  selectedGrade: "all",

  init() {
    console.log(`🚀 Initializing ${CONFIG.APP_NAME} v${CONFIG.VERSION}`);
    
    // Đảm bảo có user đăng nhập
    if (!Auth.getCurrentUser()) {
      Auth.switchRole("student");
    }

    this.renderHeader();
    this.navigate("home");
  },

  // Đổi giao diện Sáng / Tối (Light / Dark Mode)
  toggleTheme() {
    const html = document.documentElement;
    const newTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
  },

  // Chuyển đổi nhanh Role người dùng
  switchUserRole(role) {
    const user = Auth.switchRole(role);
    if (user) {
      this.renderHeader();
      if (role === "student") this.navigate("student-dashboard");
      else if (role === "teacher") this.navigate("teacher-dashboard");
      else if (role === "admin") this.navigate("admin-dashboard");
    }
  },

  // Cập nhật thông tin Header & Profile Menu
  renderHeader() {
    const user = Auth.getCurrentUser();
    const profileContainer = document.getElementById("user-profile-menu");

    document.querySelectorAll(".role-btn").forEach(btn => btn.classList.remove("active"));
    if (user) {
      const activeRoleBtn = document.getElementById(`role-${user.role}`);
      if (activeRoleBtn) activeRoleBtn.classList.add("active");
    }

    if (user && profileContainer) {
      profileContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <img src="${user.avatar}" alt="Avatar" style="width:36px; height:36px; border-radius:50%; border:2px solid var(--accent-primary);">
          <div>
            <div style="font-weight:700; font-size:0.88rem;">${user.fullName}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary); text-transform:capitalize;">${user.role} (${user.grade ? 'Lớp ' + user.grade : 'GV'})</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="App.openEditProfileModal()" style="margin-left:0.5rem;">Sửa Hồ Sơ</button>
        </div>
      `;
    }
  },

  // Chuyển đổi View chính
  navigate(viewName, params = {}) {
    this.currentView = viewName;

    // Cập nhật Nav Link active
    document.querySelectorAll(".nav-link").forEach(el => el.classList.remove("active"));
    if (viewName === "home") document.getElementById("nav-home")?.classList.add("active");
    if (viewName === "student-dashboard") document.getElementById("nav-student")?.classList.add("active");
    if (viewName === "teacher-dashboard") document.getElementById("nav-teacher")?.classList.add("active");
    if (viewName === "admin-dashboard") document.getElementById("nav-admin")?.classList.add("active");

    const container = document.getElementById("view-container");
    if (!container) return;

    // Remove in-exam-mode CSS class if navigating away from exam
    if (viewName !== "exam-room") {
      document.body.classList.remove("in-exam-mode");
      if (AntiCheatEngine.isActive) AntiCheatEngine.stop();
    }

    switch (viewName) {
      case "home":
        this.renderHomeView(container);
        break;
      case "student-dashboard":
        this.renderStudentDashboardView(container);
        break;
      case "teacher-dashboard":
        this.renderTeacherDashboardView(container);
        break;
      case "admin-dashboard":
        this.renderAdminDashboardView(container);
        break;
      case "exam-room":
        this.renderExamRoomView(container, params.exam, params.resumeSession);
        break;
      case "result-view":
        this.renderResultView(container, params.result);
        break;
      default:
        this.renderHomeView(container);
    }

    window.scrollTo(0, 0);
  },

  // =========================================================================
  // VIEW 1: TRANG CHỦ / PORTAL BÀI THI THỬ
  // =========================================================================
  renderHomeView(container) {
    const exams = Store.getItem(CONFIG.STORAGE_KEYS.EXAMS) || [];
    const subjects = CONFIG.SUBJECTS;

    // Kiểm tra xem có bài thi đang làm dở hay không
    const activeSession = Store.getItem(CONFIG.STORAGE_KEYS.ACTIVE_SESSION);
    let resumeBannerHTML = "";

    if (activeSession && activeSession.timeRemainingSeconds > 0) {
      const activeExam = exams.find(e => e.id === activeSession.examId);
      if (activeExam) {
        resumeBannerHTML = `
          <div class="glass-panel" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(239, 68, 68, 0.2)); border: 1px solid #f59e0b; padding: 1.25rem 1.75rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #fbbf24;">⚡ BẠN CÓ BÀI THI ĐANG LÀM DỞ DÀNG!</div>
              <div style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.25rem;">Bài thi: <strong>${activeExam.title}</strong> (Còn lại: ${Math.floor(activeSession.timeRemainingSeconds / 60)} phút)</div>
            </div>
            <button class="btn btn-primary btn-lg" onclick="App.resumeExam('${activeExam.id}')">▶ Khôi Phục & Làm Tiếp</button>
          </div>
        `;
      }
    }

    // Lọc danh sách đề thi
    const filteredExams = exams.filter(e => {
      const matchSubject = this.selectedSubject === "all" || e.subjectId === this.selectedSubject;
      const matchGrade = this.selectedGrade === "all" || e.grade === this.selectedGrade;
      return matchSubject && matchGrade;
    });

    container.innerHTML = `
      ${resumeBannerHTML}

      <section class="hero-section glass-panel">
        <span class="badge badge-primary" style="margin-bottom: 1rem;">NHÃN HIỆU THI THỬ THÔNG MINH #1 VIỆT NAM</span>
        <h1 class="hero-title">Nền Tảng Thi Thử Online <br><span class="gradient-text">Chuẩn GD&ĐT 2026 - Tích Hợp AI</span></h1>
        <p class="hero-subtitle">Đầy đủ 11 môn học, hệ thống Chống gian lận đa tầng, chấm điểm tức thì và trợ lý AI Tutor hỗ trợ học tập cá nhân hóa.</p>
        
        <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap;">
          <button class="btn btn-primary btn-lg" onclick="document.getElementById('exams-list-section').scrollIntoView({behavior:'smooth'})">🚀 Bắt Đầu Thi Thử Ngay</button>
          <button class="btn btn-secondary btn-lg" onclick="App.navigate('student-dashboard')">📊 Xem Điểm & Bảng Xếp Hạng</button>
        </div>
      </section>

      <!-- BỘ LỌC 11 MÔN HỌC & KHỐI LỚP -->
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.4rem; margin-bottom: 1rem;">Danh Mục Môn Học Thi Thử</h2>
        <div style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;">
          <button class="btn ${this.selectedSubject === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="App.filterSubject('all')">Tất Cả Môn</button>
          ${subjects.map(s => `
            <button class="btn ${this.selectedSubject === s.id ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="App.filterSubject('${s.id}')">
              ${s.icon} ${s.name}
            </button>
          `).join('')}
        </div>
      </section>

      <!-- DANH SÁCH ĐỀ THI -->
      <section id="exams-list-section">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <h2 style="font-size: 1.4rem;">Đề Thi Thử Mới Nhất (${filteredExams.length})</h2>
          <div>
            <select class="btn btn-secondary btn-sm" onchange="App.filterGrade(this.value)">
              <option value="all">Tất cả Khối Lớp</option>
              <option value="10">Lớp 10</option>
              <option value="11">Lớp 11</option>
              <option value="12" selected>Lớp 12</option>
            </select>
          </div>
        </div>

        <div class="grid-cols-3">
          ${filteredExams.map(exam => {
            const subj = subjects.find(s => s.id === exam.subjectId) || { name: exam.subjectId, icon: "📚", color: "#3b82f6" };
            return `
              <div class="glass-panel exam-card">
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                    <span class="badge" style="background:${subj.color}20; color:${subj.color}; border:1px solid ${subj.color}40;">
                      ${subj.icon} ${subj.name} - Lớp ${exam.grade}
                    </span>
                    <span class="badge badge-warning">🛡️ Anti-Cheat</span>
                  </div>
                  <h3 class="exam-title">${exam.title}</h3>
                </div>

                <div>
                  <div class="exam-meta" style="margin-bottom: 1rem;">
                    <span>⏱️ ${exam.durationMinutes} phút</span>
                    <span>❓ ${exam.totalQuestions} câu</span>
                    <span>👥 ${exam.attemptsCount || 0} lượt thi</span>
                  </div>
                  <button class="btn btn-primary" style="width: 100%;" onclick="App.startExamRoom('${exam.id}')">
                    📝 Làm Bài Thi Thử
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  },

  filterSubject(subjectId) {
    this.selectedSubject = subjectId;
    this.renderHomeView(document.getElementById("view-container"));
  },

  filterGrade(grade) {
    this.selectedGrade = grade;
    this.renderHomeView(document.getElementById("view-container"));
  },

  // =========================================================================
  // VIEW 2: BẢNG ĐIỀU KHIỂN HỌC SINH (STUDENT DASHBOARD)
  // =========================================================================
  renderStudentDashboardView(container) {
    const user = Auth.getCurrentUser();
    const studentExams = (Store.getItem(CONFIG.STORAGE_KEYS.STUDENT_EXAMS) || []).filter(e => e.studentId === user.id);
    const badges = CONFIG.BADGES;
    const userBadgeCodes = user.badges || [];

    const stats = AnalyticsEngine.getDashboardStats();
    const aiEval = AIEngine.evaluateCompetency(studentExams);
    const roadmap = AIEngine.generateRoadmap(studentExams);

    const avgScore = studentExams.length > 0 ? (studentExams.reduce((s, e) => s + e.score, 0) / studentExams.length).toFixed(1) : "0.0";
    const totalCorrect = studentExams.reduce((s, e) => s + e.correctCount, 0);

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 2rem;">Bảng Điều Khiển Học Sinh 🎓</h1>
        <p style="color: var(--text-secondary);">Theo dõi kết quả học tập, thành tích và lộ trình rèn luyện cá nhân hóa</p>
      </div>

      <!-- STAT CARDS -->
      <div class="grid-cols-4" style="margin-bottom: 2rem;">
        <div class="glass-panel stat-card">
          <div class="stat-icon">📝</div>
          <div>
            <div class="stat-value">${studentExams.length}</div>
            <div class="stat-label">Bài Thi Đã Nộp</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background:rgba(16,185,129,0.15); color:#10b981;">⭐</div>
          <div>
            <div class="stat-value" style="color:#10b981;">${avgScore}</div>
            <div class="stat-label">Điểm Trung Bình</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;">🎯</div>
          <div>
            <div class="stat-value" style="color:#f59e0b;">${totalCorrect}</div>
            <div class="stat-label">Số Câu Đúng</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background:rgba(139,92,246,0.15); color:#8b5cf6;">🏆</div>
          <div>
            <div class="stat-value" style="color:#8b5cf6;">${userBadgeCodes.length}</div>
            <div class="stat-label">Huy Hiệu Đã Đạt</div>
          </div>
        </div>
      </div>

      <!-- BÁO CÁO NĂNG LỰC AI & HUY HIỆU -->
      <div class="grid-cols-2" style="margin-bottom: 2rem;">
        <!-- AI Evaluation Panel -->
        <div class="glass-panel" style="padding: 1.75rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
            <span style="font-size: 1.8rem;">🤖</span>
            <div>
              <h3 style="font-size: 1.2rem;">AI Đánh Giá Năng Lực Học Tập</h3>
              <span class="badge badge-success">${aiEval.level}</span>
            </div>
          </div>

          <div style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">
            <strong>📌 Gợi Ý Lộ Trình:</strong> ${aiEval.recommendation}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.85rem; border-radius: var(--radius-sm);">
              <div style="font-weight: 700; color: #34d399; font-size: 0.85rem; margin-bottom: 0.35rem;">💪 ĐIỂM MẠNH:</div>
              ${aiEval.strengths.map(s => `<div style="font-size: 0.85rem;">• ${s}</div>`).join('')}
            </div>
            <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.85rem; border-radius: var(--radius-sm);">
              <div style="font-weight: 700; color: #f87171; font-size: 0.85rem; margin-bottom: 0.35rem;">⚠️ CẦN CẢI THIỆN:</div>
              ${aiEval.weaknesses.map(w => `<div style="font-size: 0.85rem;">• ${w}</div>`).join('')}
            </div>
          </div>
        </div>

        <!-- Badges Gamification Panel -->
        <div class="glass-panel" style="padding: 1.75rem;">
          <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">Bộ Bộ Huy Hiệu Thành Tích 🎖️</h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
            ${badges.map(b => {
              const earned = userBadgeCodes.includes(b.id) || userBadgeCodes.includes(b.code);
              return `
                <div style="text-align: center; padding: 0.85rem; background: ${earned ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.03)'}; border: 1px solid ${earned ? 'var(--accent-primary)' : 'var(--border-color)'}; border-radius: var(--radius-md); filter: ${earned ? 'none' : 'grayscale(1)'}; opacity: ${earned ? 1 : 0.4};">
                  <div style="font-size: 2.2rem; margin-bottom: 0.25rem;">${b.icon}</div>
                  <div style="font-weight: 700; font-size: 0.85rem;">${b.name}</div>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.2rem;">${b.desc}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- LỊCH SỬ LÀM BÀI -->
      <div class="glass-panel" style="padding: 1.75rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">Lịch Sử Thi Thử Chi Tiết</h3>
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tên Bài Thi</th>
                <th>Điểm Số</th>
                <th>Thời Gian</th>
                <th>Độ Chính Xác</th>
                <th>Vi Phạm</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              ${studentExams.length === 0 ? '<tr><td colspan="6" style="text-align:center;">Chưa có bài thi nào được hoàn thành</td></tr>' : ''}
              ${studentExams.map(ex => `
                <tr>
                  <td><strong>${ex.examTitle}</strong></td>
                  <td><span class="badge ${ex.score >= 8 ? 'badge-success' : ex.score >= 5 ? 'badge-warning' : 'badge-danger'}" style="font-size:0.95rem;">${ex.score} / 10</span></td>
                  <td>${Math.floor(ex.timeSpentSeconds / 60)}m ${ex.timeSpentSeconds % 60}s</td>
                  <td>${ex.accuracy}% (${ex.correctCount}/${ex.correctCount + ex.wrongCount + ex.unansweredCount})</td>
                  <td>${ex.violationsCount > 0 ? `<span class="badge badge-danger">⚠️ ${ex.violationsCount} lần</span>` : `<span class="badge badge-success">Không</span>`}</td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="App.showResultViewDirect('${ex.id}')">🔍 Xem Phân Tích</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW 3: BẢNG ĐIỀU KHIỂN GIÁO VIÊN (TEACHER DASHBOARD)
  // =========================================================================
  renderTeacherDashboardView(container) {
    const exams = Store.getItem(CONFIG.STORAGE_KEYS.EXAMS) || [];
    const questions = Store.getItem(CONFIG.STORAGE_KEYS.QUESTIONS) || [];
    const studentExams = Store.getItem(CONFIG.STORAGE_KEYS.STUDENT_EXAMS) || [];

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
        <div>
          <h1 style="font-size: 2rem;">Bảng Điều Khiển Giáo Viên 👨‍🏫</h1>
          <p style="color: var(--text-secondary);">Tạo đề thi, Upload tệp Word/PDF/Excel, Import AI và theo dõi thống kê học sinh</p>
        </div>
        <button class="btn btn-primary btn-lg" onclick="App.openCreateExamModal()">➕ Tạo Đề Thi Mới / Upload</button>
      </div>

      <!-- STAT CARDS -->
      <div class="grid-cols-3" style="margin-bottom: 2rem;">
        <div class="glass-panel stat-card">
          <div class="stat-icon">📚</div>
          <div>
            <div class="stat-value">${exams.length}</div>
            <div class="stat-label">Tổng Số Đề Thi</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background:rgba(16,185,129,0.15); color:#10b981;">❓</div>
          <div>
            <div class="stat-value" style="color:#10b981;">${questions.length}</div>
            <div class="stat-label">Câu Hỏi Trong Ngân Hàng</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background:rgba(139,92,246,0.15); color:#8b5cf6;">👥</div>
          <div>
            <div class="stat-value" style="color:#8b5cf6;">${studentExams.length}</div>
            <div class="stat-label">Lượt Bài Làm Học Sinh</div>
          </div>
        </div>
      </div>

      <!-- QUẢN LÝ ĐỀ THI -->
      <div class="glass-panel" style="padding: 1.75rem; margin-bottom: 2rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">Danh Sách Đề Thi Đã Quản Lý</h3>
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Tên Bài Thi</th>
                <th>Môn Học</th>
                <th>Khối Lớp</th>
                <th>Thời Gian</th>
                <th>Số Câu</th>
                <th>Lượt Thi</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              ${exams.map(e => `
                <tr>
                  <td><strong>${e.title}</strong></td>
                  <td><span class="badge badge-primary">${e.subjectId.toUpperCase()}</span></td>
                  <td>Lớp ${e.grade}</td>
                  <td>${e.durationMinutes} phút</td>
                  <td>${e.totalQuestions} câu</td>
                  <td>${e.attemptsCount || 0} lượt</td>
                  <td>
                    <button class="btn btn-secondary btn-sm" onclick="App.openCreateExamModal('${e.id}')">✏️ Sửa</button>
                    <button class="btn btn-danger btn-sm" onclick="App.deleteExam('${e.id}')">🗑️ Xóa</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW 4: BẢNG ĐIỀU KHIỂN QUẢN TRỊ ADMIN (ADMIN DASHBOARD)
  // =========================================================================
  renderAdminDashboardView(container) {
    const users = Store.getItem(CONFIG.STORAGE_KEYS.USERS) || [];
    const questions = Store.getItem(CONFIG.STORAGE_KEYS.QUESTIONS) || [];
    const stats = AnalyticsEngine.getDashboardStats();

    container.innerHTML = `
      <div style="margin-bottom: 2rem;">
        <h1 style="font-size: 2rem;">Bảng Điều Khiển Quản Trị Viên (Admin) 🛡️</h1>
        <p style="color: var(--text-secondary);">Quản lý người dùng, Ngân hàng câu hỏi 11 môn và theo dõi toàn bộ hệ thống</p>
      </div>

      <!-- STAT OVERVIEW -->
      <div class="grid-cols-4" style="margin-bottom: 2rem;">
        <div class="glass-panel stat-card">
          <div class="stat-icon">🎓</div>
          <div>
            <div class="stat-value">${stats.totalStudentsCount}</div>
            <div class="stat-label">Số Học Sinh</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background:rgba(16,185,129,0.15); color:#10b981;">👨‍🏫</div>
          <div>
            <div class="stat-value" style="color:#10b981;">${stats.totalTeachersCount}</div>
            <div class="stat-label">Số Giáo Viên</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;">📝</div>
          <div>
            <div class="stat-value" style="color:#f59e0b;">${stats.totalExamsCount}</div>
            <div class="stat-label">Tổng Bài Thi Đã Nộp</div>
          </div>
        </div>

        <div class="glass-panel stat-card">
          <div class="stat-icon" style="background:rgba(139,92,246,0.15); color:#8b5cf6;">⭐</div>
          <div>
            <div class="stat-value" style="color:#8b5cf6;">${stats.avgScore}</div>
            <div class="stat-label">Điểm Trung Bình Hệ Thống</div>
          </div>
        </div>
      </div>

      <!-- QUẢN LÝ NGÂN HÀNG CÂU HỎI 11 MÔN -->
      <div class="glass-panel" style="padding: 1.75rem; margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
          <h3 style="font-size: 1.2rem;">Ngân Hàng Câu Hỏi (${questions.length} câu)</h3>
          <button class="btn btn-primary btn-sm" onclick="App.openAddQuestionModal()">➕ Thêm Câu Hỏi Mới</button>
        </div>

        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Môn</th>
                <th>Lớp</th>
                <th>Mức Độ</th>
                <th>Nội Dung Câu Hỏi</th>
                <th>Đáp Án Đúng</th>
              </tr>
            </thead>
            <tbody>
              ${questions.slice(0, 10).map(q => `
                <tr>
                  <td><code>${q.id}</code></td>
                  <td><span class="badge badge-primary">${q.subjectId.toUpperCase()}</span></td>
                  <td>Lớp ${q.grade}</td>
                  <td><span class="badge badge-warning">${q.difficulty}</span></td>
                  <td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${q.content}</td>
                  <td><strong>${String.fromCharCode(65 + q.correctIndex)}</strong> (${q.options[q.correctIndex]})</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- QUẢN LÝ USER -->
      <div class="glass-panel" style="padding: 1.75rem;">
        <h3 style="font-size: 1.2rem; margin-bottom: 1rem;">Danh Sách Người Dùng (Học sinh & Giáo viên)</h3>
        <div class="data-table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Họ Và Tên</th>
                <th>Username</th>
                <th>Email</th>
                <th>Vai Trò</th>
                <th>Khối Lớp</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td><strong>${u.fullName}</strong></td>
                  <td><code>${u.username}</code></td>
                  <td>${u.email || '-'}</td>
                  <td><span class="badge ${u.role==='admin'?'badge-danger':u.role==='teacher'?'badge-warning':'badge-primary'}">${u.role.toUpperCase()}</span></td>
                  <td>${u.grade ? 'Lớp ' + u.grade : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW 5: GIAO DIỆN PHÒNG THI ONLINE (EXAM ROOM WITH ANTI-CHEAT)
  // =========================================================================
  startExamRoom(examId) {
    const exams = Store.getItem(CONFIG.STORAGE_KEYS.EXAMS) || [];
    const exam = exams.find(e => e.id === examId);
    if (!exam) return alert("Không tìm thấy bài thi!");

    // Kiểm tra session dở dang
    const resumeSession = ExamEngine.checkUnfinishedSession(examId);
    ExamEngine.startExam(exam, resumeSession);

    this.navigate("exam-room", { exam, resumeSession });
  },

  resumeExam(examId) {
    this.startExamRoom(examId);
  },

  renderExamRoomView(container, exam, resumeSession) {
    document.body.classList.add("in-exam-mode");

    const questions = ExamEngine.questions;
    const activeIndex = ExamEngine.activeQuestionIndex;
    const currentQ = questions[activeIndex];

    if (!currentQ) return;

    window.updateTimerUI = (seconds) => {
      const timerDigits = document.getElementById("timer-digits");
      if (timerDigits) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        timerDigits.textContent = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      }
    };

    container.innerHTML = `
      <div class="exam-room-container">
        <!-- CHÍNH: KHUNG CÂU HỎI -->
        <div class="glass-panel question-panel">
          <div>
            <div class="question-header">
              <div>
                <span class="badge badge-primary">Câu ${activeIndex + 1} / ${questions.length}</span>
                <span class="badge badge-warning" style="margin-left:0.5rem;">${currentQ.difficulty.toUpperCase()}</span>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="App.toggleFlagQuestion('${currentQ.id}')">
                ${ExamEngine.flaggedQuestions[currentQ.id] ? '🚩 Đã Đánh Dấu' : '🏳️ Đánh Dấu Câu'}
              </button>
            </div>

            <div class="question-body">
              ${currentQ.content}
              ${currentQ.imageUrl ? `<img src="${currentQ.imageUrl}" style="max-width:100%; border-radius:var(--radius-md); margin-top:1rem;">` : ''}
            </div>

            <div class="options-list">
              ${currentQ.options.map((opt, idx) => {
                const isSelected = ExamEngine.userAnswers[currentQ.id] === idx;
                return `
                  <div class="option-item ${isSelected ? 'selected' : ''}" onclick="App.selectOption('${currentQ.id}', ${idx})">
                    <div class="option-letter">${String.fromCharCode(65 + idx)}</div>
                    <div>${opt}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
            <button class="btn btn-secondary" onclick="App.changeQuestion(${activeIndex - 1})" ${activeIndex === 0 ? 'disabled' : ''}>
              ← Câu Trước
            </button>
            <button class="btn btn-primary" onclick="App.submitExamConfirm()">
              📥 Nộp Bài Thi
            </button>
            <button class="btn btn-secondary" onclick="App.changeQuestion(${activeIndex + 1})" ${activeIndex === questions.length - 1 ? 'disabled' : ''}>
              Câu Tiếp →
            </button>
          </div>
        </div>

        <!-- SIDEBAR: ĐỒNG HỒ & GRID CHUYỂN CÂU -->
        <div class="glass-panel exam-sidebar">
          <div class="timer-box">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">THỜI GIAN CÒN LẠI</div>
            <div class="timer-digits" id="timer-digits">00:00</div>
            <div style="font-size: 0.75rem; color: #10b981; margin-top: 0.3rem;">💾 Tự Động Lưu (Auto-Save Active)</div>
          </div>

          <div style="background: rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); padding:0.85rem; border-radius:var(--radius-sm); font-size:0.8rem; text-align:center;">
            <strong>🛡️ CHẾ ĐỘ CHỐNG GIAN LẬN:</strong><br>
            Cấm Copy/Paste • Toàn Màn Hình<br>
            Vi phạm chuyển Tab: <span style="color:#ef4444; font-weight:800;" id="violation-count-digits">${AntiCheatEngine.violationsCount}/3</span>
          </div>

          <div>
            <div style="font-weight: 700; margin-bottom: 0.75rem; font-size: 0.9rem;">Danh Sách Câu Hỏi (${questions.length})</div>
            <div class="questions-grid">
              ${questions.map((q, idx) => {
                const isAnswered = ExamEngine.userAnswers[q.id] !== undefined;
                const isCurrent = idx === activeIndex;
                const isFlagged = ExamEngine.flaggedQuestions[q.id];
                return `
                  <button class="q-grid-btn ${isAnswered ? 'answered' : ''} ${isCurrent ? 'active' : ''} ${isFlagged ? 'flagged' : ''}" onclick="App.changeQuestion(${idx})">
                    ${idx + 1}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    window.updateTimerUI(ExamEngine.timeRemainingSeconds);
  },

  selectOption(questionId, optionIndex) {
    ExamEngine.selectAnswer(questionId, optionIndex);
    this.renderExamRoomView(document.getElementById("view-container"), ExamEngine.currentExam);
  },

  toggleFlagQuestion(questionId) {
    ExamEngine.toggleFlag(questionId);
    this.renderExamRoomView(document.getElementById("view-container"), ExamEngine.currentExam);
  },

  changeQuestion(newIndex) {
    if (newIndex >= 0 && newIndex < ExamEngine.questions.length) {
      ExamEngine.activeQuestionIndex = newIndex;
      this.renderExamRoomView(document.getElementById("view-container"), ExamEngine.currentExam);
    }
  },

  submitExamConfirm() {
    if (confirm("Bạn có chắc chắn muốn NỘP BÀI THI ngay bây giờ không?")) {
      ExamEngine.submitExam("MANUAL_SUBMIT");
    }
  },

  // =========================================================================
  // VIEW 6: MÀN HÌNH KẾT QUẢ & PHÂN TÍCH BÀI THI (EXAM RESULT VIEW)
  // =========================================================================
  showResultView(result) {
    this.navigate("result-view", { result });
  },

  showResultViewDirect(resultId) {
    const studentExams = Store.getItem(CONFIG.STORAGE_KEYS.STUDENT_EXAMS) || [];
    const result = studentExams.find(r => r.id === resultId);
    if (result) this.showResultView(result);
  },

  renderResultView(container, result) {
    const allQuestions = Store.getItem(CONFIG.STORAGE_KEYS.QUESTIONS) || [];
    const exams = Store.getItem(CONFIG.STORAGE_KEYS.EXAMS) || [];
    const exam = exams.find(e => e.id === result.examId) || { questionIds: [] };

    const questions = exam.questionIds ? exam.questionIds.map(qid => allQuestions.find(q => q.id === qid)).filter(Boolean) : [];

    container.innerHTML = `
      <div class="result-header-card">
        <span class="badge badge-success" style="font-size:1rem; padding:0.4rem 1rem;">🎉 HOÀN THÀNH BÀI THI THỬ</span>
        <h1 style="font-size: 2.2rem; margin-top:0.5rem;">${result.examTitle}</h1>

        <div class="score-display">${result.score} / 10</div>

        <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap;">
          <div>⏱️ Thời gian: <strong>${Math.floor(result.timeSpentSeconds / 60)} phút ${result.timeSpentSeconds % 60} giây</strong></div>
          <div>🎯 Độ chính xác: <strong>${result.accuracy}%</strong></div>
          <div>✅ Câu Đúng: <strong style="color:#34d399;">${result.correctCount}</strong></div>
          <div>❌ Câu Sai: <strong style="color:#f87171;">${result.wrongCount}</strong></div>
          <div>⚪ Bỏ Trống: <strong>${result.unansweredCount}</strong></div>
        </div>
      </div>

      <!-- BẢNG PHÂN TÍCH TỪNG CÂU HỎI -->
      <div class="glass-panel" style="padding: 2rem; margin-bottom: 2rem;">
        <h2 style="font-size: 1.4rem; margin-bottom: 1.5rem;">Phân Tích Chi Tiết Từng Câu Hỏi</h2>

        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${questions.map((q, idx) => {
            const userAns = result.userAnswers[q.id];
            const isCorrect = userAns === q.correctIndex;
            const isUnanswered = userAns === undefined;

            return `
              <div style="padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid ${isCorrect ? 'rgba(16,185,129,0.4)' : isUnanswered ? 'var(--border-color)' : 'rgba(239,68,68,0.4)'}; background: ${isCorrect ? 'rgba(16,185,129,0.05)' : isUnanswered ? 'rgba(255,255,255,0.02)' : 'rgba(239,68,68,0.05)'};">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                  <span class="badge ${isCorrect ? 'badge-success' : isUnanswered ? 'badge-warning' : 'badge-danger'}">
                    Câu ${idx + 1}: ${isCorrect ? '✅ ĐÚNG' : isUnanswered ? '⚪ CHƯA LÀM' : '❌ SAI'}
                  </span>
                  <button class="btn btn-secondary btn-sm" onclick="App.askAITutorForQuestion('${q.id}')">🤖 Hỏi AI Tutor Câu Này</button>
                </div>

                <div style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem;">${q.content}</div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
                  ${q.options.map((opt, oIdx) => {
                    const isUserChoice = userAns === oIdx;
                    const isRightChoice = q.correctIndex === oIdx;
                    let style = "background:rgba(255,255,255,0.03); border:1px solid var(--border-color);";
                    if (isRightChoice) style = "background:rgba(16,185,129,0.2); border:1px solid #10b981; color:#34d399; font-weight:700;";
                    else if (isUserChoice && !isCorrect) style = "background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#f87171;";

                    return `
                      <div style="padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); ${style}">
                        ${String.fromCharCode(65 + oIdx)}. ${opt} ${isRightChoice ? ' (Đáp án đúng ✓)' : ''} ${isUserChoice && !isCorrect ? ' (Bạn chọn ✗)' : ''}
                      </div>
                    `;
                  }).join('')}
                </div>

                <div style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); padding: 0.85rem; border-radius: var(--radius-sm); font-size: 0.9rem;">
                  <strong>💡 Lời giải chi tiết:</strong> ${q.explanation}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 3rem;">
        <button class="btn btn-primary btn-lg" onclick="App.navigate('home')">🏠 Về Trang Chủ Thi Đề Khác</button>
      </div>
    `;
  },

  // =========================================================================
  // MODALS & AI TUTOR CHAT
  // =========================================================================
  toggleAIChat() {
    const box = document.getElementById("ai-chat-box");
    if (box) {
      if (box.classList.contains("open")) box.classList.remove("open");
      else box.classList.add("open");
    }
  },

  async sendAIChatMessage() {
    const input = document.getElementById("ai-chat-input");
    const container = document.getElementById("ai-chat-messages");
    if (!input || !container || !input.value.trim()) return;

    const userText = input.value.trim();
    input.value = "";

    container.innerHTML += `<div class="chat-bubble user">${userText}</div>`;
    container.scrollTop = container.scrollHeight;

    const reply = await AIEngine.chatExplainQuestion({ content: "Hỏi đáp kiến thức tổng hợp", options: ["A", "B"], correctIndex: 0, explanation: "Kiến thức căn bản môn học" }, 0, userText);
    container.innerHTML += `<div class="chat-bubble bot">${reply}</div>`;
    container.scrollTop = container.scrollHeight;
  },

  askAITutorForQuestion(questionId) {
    this.toggleAIChat();
    const input = document.getElementById("ai-chat-input");
    if (input) {
      input.value = `Giải thích kĩ hơn cho em câu hỏi ID ${questionId} được không ạ?`;
      this.sendAIChatMessage();
    }
  },

  // MODAL UPLOAD / TẠO ĐỀ THI CHO GIÁO VIÊN
  openCreateExamModal(examId = null) {
    const modalContainer = document.getElementById("modal-container");
    modalContainer.innerHTML = `
      <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem;">
        <div class="glass-panel" style="max-width:640px; width:100%; padding:2rem; background:#1e293b; border-radius:var(--radius-lg);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h2 style="font-size:1.4rem;">Tạo Đề Thi Mới & Upload Tệp</h2>
            <button onclick="document.getElementById('modal-container').innerHTML=''" style="background:transparent; border:none; color:#fff; font-size:1.2rem; cursor:pointer;">✕</button>
          </div>

          <form onsubmit="App.handleSaveExam(event)">
            <div style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.35rem;">Tên Bài Thi</label>
              <input type="text" id="m-exam-title" required class="ai-chat-input" style="width:100%;" placeholder="VD: Đề Thi Thử Tốt Nghiệp THPT 2026 Môn Toán">
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.35rem;">Môn Học (11 Môn)</label>
                <select id="m-exam-subject" class="ai-chat-input" style="width:100%;">
                  ${CONFIG.SUBJECTS.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
                </select>
              </div>

              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.35rem;">Thời Gian Làm Bài (Phút)</label>
                <input type="number" id="m-exam-duration" value="45" min="5" max="180" class="ai-chat-input" style="width:100%;">
              </div>
            </div>

            <div style="background:rgba(255,255,255,0.03); border:1px dashed var(--border-glow); padding:1.25rem; border-radius:var(--radius-md); text-align:center; margin-bottom:1.5rem;">
              <div style="font-size:1.5rem; margin-bottom:0.5rem;">📄 📁 🤖</div>
              <div style="font-size:0.95rem; font-weight:700;">Upload Tệp Đề Thi (Word, PDF, Excel) hoặc Sinh bằng AI</div>
              <p style="font-size:0.8rem; color:var(--text-secondary); margin:0.3rem 0 1rem 0;">Hỗ trợ .docx, .pdf, matrix .xlsx hoặc nhập nội dung bằng AI</p>
              
              <input type="file" id="m-exam-file" accept=".docx,.pdf,.xlsx,.csv,.txt" style="display:none;" onchange="App.handleFileUpload(this)">
              <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('m-exam-file').click()">📂 Chọn Tệp Từ Máy Tích</button>
              <button type="button" class="btn btn-primary btn-sm" onclick="App.generateAIExamAuto()">🤖 Sinh Đề Tự Động Bằng AI</button>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-container').innerHTML=''">Hủy</button>
              <button type="submit" class="btn btn-primary">💾 Xuất Bản Đề Thi</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  async generateAIExamAuto() {
    alert("🤖 AI đang tự động tạo 4 câu hỏi trắc nghiệm full đáp án & lời giải...");
    const subj = document.getElementById("m-exam-subject").value;
    const aiQuestions = await AIEngine.generateQuestions(subj, "12", 4, "Chuyên đề Tổng hợp 2026");

    const allQuestions = Store.getItem(CONFIG.STORAGE_KEYS.QUESTIONS) || [];
    const newQuestions = [...aiQuestions, ...allQuestions];
    Store.setItem(CONFIG.STORAGE_KEYS.QUESTIONS, newQuestions);

    alert("✅ AI đã sinh thành công 4 câu hỏi mới và nạp vào Ngân hàng dữ liệu!");
  },

  handleSaveExam(e) {
    e.preventDefault();
    const title = document.getElementById("m-exam-title").value;
    const subjectId = document.getElementById("m-exam-subject").value;
    const durationMinutes = parseInt(document.getElementById("m-exam-duration").value);

    const allQuestions = Store.getItem(CONFIG.STORAGE_KEYS.QUESTIONS) || [];
    const subjectQuestions = allQuestions.filter(q => q.subjectId === subjectId);
    const qIds = subjectQuestions.length >= 4 ? subjectQuestions.slice(0, 4).map(q => q.id) : allQuestions.slice(0, 4).map(q => q.id);

    const exams = Store.getItem(CONFIG.STORAGE_KEYS.EXAMS) || [];
    const newExam = {
      id: "ex_" + Date.now(),
      title: title,
      subjectId: subjectId,
      grade: "12",
      durationMinutes: durationMinutes,
      totalQuestions: qIds.length,
      questionIds: qIds,
      createdBy: Auth.getCurrentUser().fullName,
      createdAt: new Date().toISOString(),
      attemptsCount: 0
    };

    exams.unshift(newExam);
    Store.setItem(CONFIG.STORAGE_KEYS.EXAMS, exams);

    document.getElementById("modal-container").innerHTML = "";
    alert("🎉 Tạo bài thi mới thành công!");
    this.renderTeacherDashboardView(document.getElementById("view-container"));
  },

  openEditProfileModal() {
    const user = Auth.getCurrentUser();
    const modalContainer = document.getElementById("modal-container");

    modalContainer.innerHTML = `
      <div style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem;">
        <div class="glass-panel" style="max-width:480px; width:100%; padding:2rem; background:#1e293b; border-radius:var(--radius-lg);">
          <h2 style="font-size:1.4rem; margin-bottom:1.5rem;">Cập Nhật Hồ Sơ Cá Nhân 👤</h2>
          <form onsubmit="App.handleUpdateProfile(event)">
            <div style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.35rem;">Họ Và Tên</label>
              <input type="text" id="p-fullname" value="${user.fullName}" required class="ai-chat-input" style="width:100%;">
            </div>
            <div style="margin-bottom:1rem;">
              <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.35rem;">Email</label>
              <input type="email" id="p-email" value="${user.email}" required class="ai-chat-input" style="width:100%;">
            </div>
            <div style="margin-bottom:1.5rem;">
              <label style="display:block; font-size:0.85rem; font-weight:700; margin-bottom:0.35rem;">Khối Lớp</label>
              <select id="p-grade" class="ai-chat-input" style="width:100%;">
                <option value="10" ${user.grade==='10'?'selected':''}>Lớp 10</option>
                <option value="11" ${user.grade==='11'?'selected':''}>Lớp 11</option>
                <option value="12" ${user.grade==='12'?'selected':''}>Lớp 12</option>
              </select>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-container').innerHTML=''">Hủy</button>
              <button type="submit" class="btn btn-primary">Lưu Thay Đổi</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  handleUpdateProfile(e) {
    e.preventDefault();
    const fullName = document.getElementById("p-fullname").value;
    const email = document.getElementById("p-email").value;
    const grade = document.getElementById("p-grade").value;

    Auth.updateProfile({ fullName, email, grade });
    document.getElementById("modal-container").innerHTML = "";
    this.renderHeader();
    alert("✅ Cập nhật hồ sơ thành công!");
  }
};

// Khởi chạy khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
