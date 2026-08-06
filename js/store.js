/**
 * STORE.JS - Data Store & Local Database Initialization
 * Quản lý dữ liệu tập trung với LocalStorage persistence
 */

const Store = {
  // Khởi tạo dữ liệu ban đầu nếu chưa có
  init() {
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.USERS)) {
      this.seedUsers();
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.QUESTIONS)) {
      this.seedQuestions();
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.EXAMS)) {
      this.seedExams();
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.STUDENT_EXAMS)) {
      this.seedStudentExams();
    }
  },

  // Khởi tạo danh sách người dùng mẫu (Admin, Teacher, Student)
  seedUsers() {
    const defaultUsers = [
      {
        id: "usr_admin",
        username: "admin",
        password: "123",
        fullName: "Nguyễn Văn Admin",
        email: "admin@edutest.edu.vn",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        createdAt: "2026-01-01T00:00:00Z"
      },
      {
        id: "usr_teacher1",
        username: "teacher",
        password: "123",
        fullName: "Thầy Trần Hoàng Nam",
        email: "nam.tran@edutest.edu.vn",
        role: "teacher",
        subject: "toan",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        createdAt: "2026-01-05T00:00:00Z"
      },
      {
        id: "usr_student1",
        username: "student",
        password: "123",
        fullName: "Lê Minh Khoa",
        email: "khoa.le@gmail.com",
        role: "student",
        grade: "12",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        badges: ["b1", "b2", "b3"],
        createdAt: "2026-02-10T00:00:00Z"
      },
      {
        id: "usr_student2",
        username: "student2",
        password: "123",
        fullName: "Nguyễn Thu Hà",
        email: "ha.nguyen@gmail.com",
        role: "student",
        grade: "12",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        badges: ["b1", "b5"],
        createdAt: "2026-02-12T00:00:00Z"
      }
    ];
    this.setItem(CONFIG.STORAGE_KEYS.USERS, defaultUsers);
  },

  // Khởi tạo Ngân hàng câu hỏi phong phú cho 11 môn học
  seedQuestions() {
    const questions = [
      // TOÁN LỚP 12
      {
        id: "q_toan_01",
        subjectId: "toan",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Nghiệm của phương trình $2^{x-1} = 8$ là gì?",
        options: ["x = 3", "x = 4", "x = 2", "x = 5"],
        correctIndex: 1,
        explanation: "Ta có $2^{x-1} = 8 = 2^3 \\Rightarrow x - 1 = 3 \\Rightarrow x = 4$.",
        imageUrl: ""
      },
      {
        id: "q_toan_02",
        subjectId: "toan",
        grade: "12",
        difficulty: "thong_hieu",
        content: "Cho hàm số $y = x^3 - 3x + 2$. Giá trị cực đại của hàm số đã cho bằng:",
        options: ["4", "0", "2", "-2"],
        correctIndex: 0,
        explanation: "Đạo hàm $y' = 3x^2 - 3 = 0 \\Rightarrow x = \\pm 1$. Bảng biến thiên cho thấy cực đại đạt tại $x = -1 \\Rightarrow y_{CĐ} = (-1)^3 - 3(-1) + 2 = 4$.",
        imageUrl: ""
      },
      {
        id: "q_toan_03",
        subjectId: "toan",
        grade: "12",
        difficulty: "van_dung",
        content: "Tính thể tích $V$ của khối nón có bán kính đáy $r = 3$ và chiều cao $h = 4$.",
        options: ["V = 12\\pi", "V = 36\\pi", "V = 16\\pi", "V = 48\\pi"],
        correctIndex: 0,
        explanation: "Công thức thể tích khối nón: $V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi \\cdot 3^2 \\cdot 4 = 12\\pi$.",
        imageUrl: ""
      },
      {
        id: "q_toan_04",
        subjectId: "toan",
        grade: "12",
        difficulty: "van_dung_cao",
        content: "Tính tích phân $I = \\int_{0}^{1} x e^x dx$.",
        options: ["I = 1", "I = e", "I = e - 1", "I = e + 1"],
        correctIndex: 0,
        explanation: "Sử dụng tích phân từng phần: Đặt $u = x \\Rightarrow du = dx$; $dv = e^x dx \\Rightarrow v = e^x$. Do đó $I = [x e^x]_0^1 - \\int_0^1 e^x dx = e - (e - 1) = 1$.",
        imageUrl: ""
      },

      // NGỮ VĂN LỚP 12
      {
        id: "q_van_01",
        subjectId: "van",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Tác phẩm 'Tây Tiến' của nhà thơ Quang Dũng được sáng tác vào năm nào?",
        options: ["1947", "1948", "1954", "1960"],
        correctIndex: 1,
        explanation: "Bài thơ Tây Tiến được sáng tác năm 1948 tại Phù Lưu Chanh khi tác giả chuyển sang đơn vị mới.",
        imageUrl: ""
      },
      {
        id: "q_van_02",
        subjectId: "van",
        grade: "12",
        difficulty: "thong_hieu",
        content: "Hình tượng dòng sông Đà trong tùy bút 'Người lái đò Sông Đà' của Nguyễn Tuân mang hai nét tính cách tiêu biểu nào?",
        options: ["Hung bạo và thơ mộng trữ tình", "Hiền hòa và dữ dội", "Bình yên và cuộn sóng", "Sâu thẳm và bao la"],
        correctIndex: 0,
        explanation: "Sông Đà hiện lên qua ngòi bút Nguyễn Tuân với hai nét diện mạo đối lập nhưng thống nhất: Hung bạo hùng vĩ và Thơ mộng trữ tình.",
        imageUrl: ""
      },

      // TIẾNG ANH LỚP 12
      {
        id: "q_anh_01",
        subjectId: "anh",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Choose the word whose underlined part is pronounced differently: A. direct B. decide C. digital D. divide",
        options: ["direct", "decide", "digital", "divide"],
        correctIndex: 2,
        explanation: "'digital' has /ɪ/ sound while the others have /aɪ/ sound.",
        imageUrl: ""
      },
      {
        id: "q_anh_02",
        subjectId: "anh",
        grade: "12",
        difficulty: "thong_hieu",
        content: "If he _______ harder, he would have passed the final examination.",
        options: ["studied", "had studied", "studies", "would study"],
        correctIndex: 1,
        explanation: "Conditional Sentence Type 3: If + S + had + P.II, S + would + have + P.II.",
        imageUrl: ""
      },

      // VẬT LÝ LỚP 12
      {
        id: "q_ly_01",
        subjectId: "ly",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Công thức tính chu kỳ dao động điều hòa của con lắc lò xo là:",
        options: ["T = 2\\pi \\sqrt{\\frac{m}{k}}", "T = 2\\pi \\sqrt{\\frac{k}{m}}", "T = 2\\pi \\sqrt{\\frac{g}{l}}", "T = \\frac{1}{2\\pi} \\sqrt{\\frac{m}{k}}"],
        correctIndex: 0,
        explanation: "Chu kỳ dao động con lắc lò xo: $T = 2\\pi \\sqrt{\\frac{m}{k}}$.",
        imageUrl: ""
      },

      // HÓA HỌC LỚP 12
      {
        id: "q_hoa_01",
        subjectId: "hoa",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Công thức phân tử của Glucozơ là gì?",
        options: ["C6H12O6", "C12H22O11", "(C6H10O5)n", "C2H5OH"],
        correctIndex: 0,
        explanation: "Glucozơ là một monosaccarit có công thức phân tử C6H12O6.",
        imageUrl: ""
      },

      // SINH HỌC LỚP 12
      {
        id: "q_sinh_01",
        subjectId: "sinh",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Quá trình nhân đôi ADN diễn ra ở pha nào của chu kỳ tế bào?",
        options: ["Pha S của kỳ trung gian", "Pha G1", "Pha G2", "Kỳ đầu của phân bào"],
        correctIndex: 0,
        explanation: "Sự nhân đôi ADN diễn ra vào pha S (Synthesis) thuộc kỳ trung gian.",
        imageUrl: ""
      },

      // LỊCH SỬ LỚP 12
      {
        id: "q_su_01",
        subjectId: "su",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Chiến dịch Điện Biên Phủ diễn ra và kết thúc thắng lợi vào năm nào?",
        options: ["1945", "1954", "1975", "1968"],
        correctIndex: 1,
        explanation: "Chiến dịch Điện Biên Phủ toàn thắng vào ngày 7/5/1954.",
        imageUrl: ""
      },

      // ĐỊA LÝ LỚP 12
      {
        id: "q_dia_01",
        subjectId: "dia",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Nước ta nằm trong vùng nội chí tuyến nên có tính chất khí hậu đặc trưng là:",
        options: ["Nhiệt đới ẩm gió mùa", "Ôn đới lục địa", "Hàn đới", "Nhiệt đới khô"],
        correctIndex: 0,
        explanation: "Vị trí địa lý quy định tính chất nhiệt đới ẩm gió mùa của khí hậu Việt Nam.",
        imageUrl: ""
      },

      // GDKT & PL LỚP 12
      {
        id: "q_gdktpl_01",
        subjectId: "gdktpl",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Hình thức pháp luật có giá trị pháp lý cao nhất trong hệ thống pháp luật Việt Nam là:",
        options: ["Hiến pháp", "Bộ luật", "Nghị định", "Thông tư"],
        correctIndex: 0,
        explanation: "Hiến pháp là đạo luật cơ bản của Nhà nước, có hiệu lực pháp lý cao nhất.",
        imageUrl: ""
      },

      // TIN HỌC LỚP 12
      {
        id: "q_tin_01",
        subjectId: "tin",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Trong CSDL quan hệ, khóa chính (Primary Key) có vai trò gì?",
        options: ["Xác định duy nhất một bản ghi trong bảng", "Liên kết với bảng khác", "Lưu trữ dữ liệu mã hóa", "Sắp xếp ngẫu nhiên"],
        correctIndex: 0,
        explanation: "Khóa chính là tập hợp một hoặc nhiều thuộc tính dùng để phân biệt duy nhất từng hàng dữ liệu.",
        imageUrl: ""
      },

      // CÔNG NGHỆ LỚP 12
      {
        id: "q_congnghe_01",
        subjectId: "congnghe",
        grade: "12",
        difficulty: "nhan_biet",
        content: "Linh kiện điện tử nào sau đây dùng để hạn chế dòng điện trong mạch?",
        options: ["Điện trở", "Tụ điện", "Cuộn cảm", "Điốt"],
        correctIndex: 0,
        explanation: "Điện trở là linh kiện có tác dụng cản trở và hạn chế dòng điện.",
        imageUrl: ""
      }
    ];

    this.setItem(CONFIG.STORAGE_KEYS.QUESTIONS, questions);
  },

  // Khởi tạo danh sách Đề thi mẫu
  seedExams() {
    const exams = [
      {
        id: "ex_toan_thpt2026",
        title: "Đề Thi Thử Tốt Nghiệp THPT 2026 - Môn Toán (Chính Thức)",
        subjectId: "toan",
        grade: "12",
        durationMinutes: 45, // 45 phút cho thi thử mẫu
        totalQuestions: 4,
        questionIds: ["q_toan_01", "q_toan_02", "q_toan_03", "q_toan_04"],
        createdBy: "Thầy Trần Hoàng Nam",
        createdAt: "2026-03-01T08:00:00Z",
        attemptsCount: 142,
        avgScore: 7.8
      },
      {
        id: "ex_van_12",
        title: "Đề Thi Thử Học Kỳ II - Môn Ngữ Văn 12",
        subjectId: "van",
        grade: "12",
        durationMinutes: 60,
        totalQuestions: 2,
        questionIds: ["q_van_01", "q_van_02"],
        createdBy: "Thầy Trần Hoàng Nam",
        createdAt: "2026-03-02T09:30:00Z",
        attemptsCount: 89,
        avgScore: 8.2
      },
      {
        id: "ex_anh_12",
        title: "Đề Tăng Tốc Tiếng Anh 12 - Chuyên Đề Phát Âm & Cấu Trúc",
        subjectId: "anh",
        grade: "12",
        durationMinutes: 30,
        totalQuestions: 2,
        questionIds: ["q_anh_01", "q_anh_02"],
        createdBy: "Admin",
        createdAt: "2026-03-03T10:00:00Z",
        attemptsCount: 210,
        avgScore: 8.5
      },
      {
        id: "ex_tonghop_12",
        title: "Đề Thi Thử Đánh Giá Năng Lực 2026 - Tổng Hợp KHTN",
        subjectId: "ly",
        grade: "12",
        durationMinutes: 45,
        totalQuestions: 3,
        questionIds: ["q_ly_01", "q_hoa_01", "q_sinh_01"],
        createdBy: "Thầy Trần Hoàng Nam",
        createdAt: "2026-03-05T14:00:00Z",
        attemptsCount: 95,
        avgScore: 7.5
      }
    ];

    this.setItem(CONFIG.STORAGE_KEYS.EXAMS, exams);
  },

  // Khởi tạo Lịch sử làm bài mẫu của Học sinh
  seedStudentExams() {
    const studentExams = [
      {
        id: "se_001",
        studentId: "usr_student1",
        examId: "ex_toan_thpt2026",
        examTitle: "Đề Thi Thử Tốt Nghiệp THPT 2026 - Môn Toán (Chính Thức)",
        subjectId: "toan",
        score: 10.0,
        correctCount: 4,
        wrongCount: 0,
        unansweredCount: 0,
        accuracy: 100,
        timeSpentSeconds: 1250, // ~20 phút
        userAnswers: { "q_toan_01": 1, "q_toan_02": 0, "q_toan_03": 0, "q_toan_04": 0 },
        violationsCount: 0,
        submittedAt: "2026-03-10T14:20:00Z"
      },
      {
        id: "se_002",
        studentId: "usr_student2",
        examId: "ex_anh_12",
        examTitle: "Đề Tăng Tốc Tiếng Anh 12 - Chuyên Đề Phát Âm & Cấu Trúc",
        subjectId: "anh",
        score: 5.0,
        correctCount: 1,
        wrongCount: 1,
        unansweredCount: 0,
        accuracy: 50,
        timeSpentSeconds: 600,
        userAnswers: { "q_anh_01": 2, "q_anh_02": 0 },
        violationsCount: 1,
        submittedAt: "2026-03-11T16:00:00Z"
      }
    ];

    this.setItem(CONFIG.STORAGE_KEYS.STUDENT_EXAMS, studentExams);
  },

  // Helper truy xuất dữ liệu từ LocalStorage
  getItem(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Lỗi đọc dữ liệu:", e);
      return null;
    }
  },

  // Helper ghi dữ liệu vào LocalStorage
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Lỗi ghi dữ liệu:", e);
    }
  }
};

// Khởi tạo ngay khi script load
Store.init();
