/**
 * AI_ENGINE.JS - Integrated AI Intelligence Engine
 * Sinh câu hỏi, sinh lời giải, Đánh giá năng lực, Lập lộ trình học & AI Tutor Chatbot
 */

const AIEngine = {
  // 1. AI Sinh bộ câu hỏi tự động theo môn học & chủ đề
  async generateQuestions(subjectId, grade, count = 3, topic = "Tổng hợp") {
    console.log(`🤖 AI is generating ${count} questions for subject: ${subjectId}, grade: ${grade}`);
    
    // Giả lập xử lý AI thần tốc
    await new Promise(res => setTimeout(res, 800));

    const subjectObj = CONFIG.SUBJECTS.find(s => s.id === subjectId) || { name: subjectId };

    const generated = [];
    for (let i = 1; i <= count; i++) {
      generated.push({
        id: `q_ai_${Date.now()}_${i}`,
        subjectId: subjectId,
        grade: grade,
        difficulty: i === 1 ? "nhan_biet" : i === 2 ? "thong_hieu" : "van_dung",
        content: `[AI Generated] Câu hỏi mẫu số ${i} chuyên đề ${topic} môn ${subjectObj.name} lớp ${grade}: Xác định phát biểu đúng nhất trong các phương án sau?`,
        options: [
          `Phương án A: Giá trị đại diện chuẩn xác cho kiến thức ${subjectObj.name}`,
          `Phương án B: Trường hợp ngoại lệ trong bài tập ${topic}`,
          `Phương án C: Khái niệm mở rộng môn ${subjectObj.name}`,
          `Phương án D: Định lý cơ bản chưa được áp dụng`
        ],
        correctIndex: 0,
        explanation: `Lời giải chi tiết do AI sinh tự động: Phân tích kiến thức môn ${subjectObj.name} cho thấy Phương án A là đáp án chính xác theo chương trình học lớp ${grade}.`,
        imageUrl: ""
      });
    }

    return generated;
  },

  // 2. AI Đánh giá Năng lực Học sinh dựa trên Lịch sử Thi
  evaluateCompetency(studentExams) {
    if (!studentExams || studentExams.length === 0) {
      return {
        level: "Chưa đánh giá",
        overallRating: 0,
        strengths: ["Cần hoàn thành bài thi đầu tiên để AI phân tích năng lực"],
        weaknesses: ["Chưa có dữ liệu"],
        recommendation: "Hãy chọn một bài thi bất kỳ trong danh sách để bắt đầu!"
      };
    }

    const avgScore = (studentExams.reduce((s, e) => s + e.score, 0) / studentExams.length).toFixed(1);
    const avgAccuracy = Math.round(studentExams.reduce((s, e) => s + e.accuracy, 0) / studentExams.length);

    let level = "Trung bình";
    let strengths = [];
    let weaknesses = [];

    if (avgScore >= 8.5) {
      level = "Xuất sắc (Tối ưu điểm 9+)";
      strengths = ["Tư duy duy logic tốt", "Tốc độ phản xạ nhanh", "Độ chính xác cao (>85%)"];
      weaknesses = ["Cần chú ý các bẫy nhỏ ở câu Vận dụng cao"];
    } else if (avgScore >= 6.5) {
      level = "Khá (Cần bứt phá)";
      strengths = ["Nắm chắc kiến thức Nhận biết & Thông hiểu"];
      weaknesses = ["Tốc độ phân tích bài tập Vận dụng còn chậm", "Đôi khi sót dữ kiện đề bài"];
    } else {
      level = "Trung bình (Cần củng cố kiến thức nền)";
      strengths = ["Có tinh thần rèn luyện tích cực"];
      weaknesses = ["Sai nhiều ở lý thuyết cơ bản", "Thời gian làm bài chưa tối ưu"];
    }

    return {
      level,
      overallRating: avgScore,
      accuracyRate: avgAccuracy,
      strengths,
      weaknesses,
      recommendation: `Dựa trên ${studentExams.length} bài thi đã làm, AI gợi ý bạn nên tập trung ôn tập thêm 20 phút mỗi ngày ở chuyên đề vận dụng để nâng điểm số lên ${Math.min(10, parseFloat(avgScore) + 1.5)}.`
    };
  },

  // 3. AI Đề xuất Lộ trình Học tập Cá nhân hóa
  generateRoadmap(studentExams) {
    const evalData = this.evaluateCompetency(studentExams);
    
    return [
      {
        step: 1,
        title: "Giai đoạn 1: Củng cố Nền tảng (Tuần 1 - 2)",
        focus: "Ôn lại lý thuyết Nhận biết & Thông hiểu 11 môn học trọng tâm",
        target: "Đạt độ chính xác > 80% cho các câu hỏi lý thuyết",
        status: "Đang thực hiện"
      },
      {
        step: 2,
        title: "Giai đoạn 2: Luyện Dạng Bài Vận Dụng (Tuần 3 - 4)",
        focus: "Tập trung giải các đề thi thử thời lượng 45 phút môn Toán & Tiếng Anh",
        target: "Nâng điểm số trung bình từ " + evalData.overallRating + " lên " + (parseFloat(evalData.overallRating) + 1.0).toFixed(1),
        status: "Tiếp theo"
      },
      {
        step: 3,
        title: "Giai đoạn 3: Tăng Tốc & Chinh Phục Điểm 9+ (Tuần 5 - 6)",
        focus: "Luyện đề thi thử có Anti-Cheat áp lực thời gian chuẩn như thi thật",
        target: "Tối ưu hóa thời gian làm bài & đạt huy hiệu Thủ Khoa Tương Lai",
        status: "Mục tiêu"
      }
    ];
  },

  // 4. AI Tutor Chatbot - Giải thích chi tiết từng câu hỏi cho học sinh
  async chatExplainQuestion(question, studentAnswer, userMessage) {
    await new Promise(res => setTimeout(res, 600));

    const optionText = question.options[studentAnswer] || "Chưa chọn";
    const correctText = question.options[question.correctIndex];

    if (userMessage.toLowerCase().includes("tại sao") || userMessage.toLowerCase().includes("vì sao")) {
      return `🤖 **AI Tutor Giải Thích**: \n\nTrong câu hỏi này, đáp án đúng là **"${correctText}"**.\n\n*Lý do:* ${question.explanation}\n\nBạn đã chọn phương án "${optionText}". Điểm chưa đúng là phương án này chưa thỏa mãn điều kiện cốt lõi của đề bài. Bạn có cần thầy giải thích chi tiết hơn ở bước nào không?`;
    }

    return `🤖 **AI Tutor Đáp**: Chào em! Đối với câu hỏi này: \n"${question.content}"\n\n📌 **Đáp án chuẩn**: ${correctText}\n💡 **Gợi ý từ AI**: Em hãy chú ý từ khóa quan trọng trong câu hỏi và áp dụng công thức/lý thuyết cốt lõi để không bị nhầm lẫn nhé!`;
  }
};
