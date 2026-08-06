/**
 * IMPORTER_ENGINE.JS - Multi-Format Exam Importer Engine
 * Đọc & phân tích tệp Word (.docx), PDF, Excel (.csv/.xlsx) và Import bằng AI
 */

const ImporterEngine = {
  // 1. Phân tích nội dung thô (từ AI Import hoặc copy/paste từ Word/PDF)
  parseRawText(rawText, subjectId = "toan", grade = "12") {
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
    const questions = [];

    let currentQ = null;

    lines.forEach(line => {
      // Nhận diện bắt đầu câu hỏi: "Câu 1:", "Câu 2.", "1.", "2:"
      const qMatch = line.match(/^(Câu\s*\d+|[\d]+)[\:\.](.*)/i);
      
      if (qMatch) {
        if (currentQ && currentQ.content) {
          questions.push(this.finalizeQuestion(currentQ, subjectId, grade));
        }
        currentQ = {
          content: qMatch[2].trim(),
          options: [],
          correctIndex: 0,
          explanation: ""
        };
      } else if (currentQ) {
        // Nhận diện lựa chọn A., B., C., D. hoặc Lời giải
        const optMatch = line.match(/^([A-D])[\.\:\)]\s*(.*)/i);
        const ansMatch = line.match(/^(Đáp án|Đáp án đúng)[\:\:]\s*([A-D])/i);
        const expMatch = line.match(/^(Lời giải|Giải chi tiết)[\:\:]\s*(.*)/i);

        if (optMatch) {
          currentQ.options.push(optMatch[2].trim());
        } else if (ansMatch) {
          const char = ansMatch[2].toUpperCase();
          currentQ.correctIndex = char === "A" ? 0 : char === "B" ? 1 : char === "C" ? 2 : 3;
        } else if (expMatch) {
          currentQ.explanation = expMatch[2].trim();
        } else {
          // Nối thêm nội dung câu hỏi hoặc lời giải
          if (currentQ.options.length === 0) {
            currentQ.content += " " + line;
          } else {
            currentQ.explanation += " " + line;
          }
        }
      }
    });

    if (currentQ && currentQ.content) {
      questions.push(this.finalizeQuestion(currentQ, subjectId, grade));
    }

    return questions;
  },

  // Chuẩn hóa cấu trúc câu hỏi sau khi parse
  finalizeQuestion(q, subjectId, grade) {
    // Nếu chưa đủ 4 option, tự bổ sung mẫu
    while (q.options.length < 4) {
      q.options.push(`Phương án ${String.fromCharCode(65 + q.options.length)}`);
    }

    return {
      id: "q_imp_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      subjectId: subjectId,
      grade: grade,
      difficulty: "thong_hieu",
      content: q.content || "Câu hỏi nhập tự động",
      options: q.options.slice(0, 4),
      correctIndex: q.correctIndex || 0,
      explanation: q.explanation || "Lời giải chi tiết đang được cập nhật.",
      imageUrl: ""
    };
  },

  // 2. Mô phỏng đọc file Word (.docx)
  async parseWordFile(file, subjectId, grade) {
    // Trích xuất văn bản từ file (Giả lập cho preview hoặc đọc FileReader text)
    const text = await this.readFileAsText(file);
    if (text) {
      return this.parseRawText(text, subjectId, grade);
    }
    // Mẫu câu hỏi khi nạp file Word demo
    return this.generateSampleImportedQuestions("Word", file.name, subjectId, grade);
  },

  // 3. Mô phỏng đọc file PDF
  async parsePdfFile(file, subjectId, grade) {
    const text = await this.readFileAsText(file);
    if (text) {
      return this.parseRawText(text, subjectId, grade);
    }
    return this.generateSampleImportedQuestions("PDF", file.name, subjectId, grade);
  },

  // 4. Mô phỏng đọc file Excel (.xlsx / .csv)
  async parseExcelFile(file, subjectId, grade) {
    return this.generateSampleImportedQuestions("Excel Matrix", file.name, subjectId, grade);
  },

  // Helper đọc file text
  readFileAsText(file) {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = () => resolve("");
      reader.readAsText(file);
    });
  },

  // Giả lập danh sách câu hỏi xem trước khi upload file
  generateSampleImportedQuestions(fileType, fileName, subjectId, grade) {
    return [
      {
        id: `q_${fileType.toLowerCase()}_1_${Date.now()}`,
        subjectId: subjectId,
        grade: grade,
        difficulty: "nhan_biet",
        content: `[Nhập từ ${fileType}: ${fileName}] Câu 1: Đơn vị đo cường độ dòng điện trong hệ SI là gì?`,
        options: ["Ampe (A)", "Vôn (V)", "Om (Ω)", "Oát (W)"],
        correctIndex: 0,
        explanation: "Cường độ dòng điện được đo bằng đơn vị Ampe (A).",
        imageUrl: ""
      },
      {
        id: `q_${fileType.toLowerCase()}_2_${Date.now()}`,
        subjectId: subjectId,
        grade: grade,
        difficulty: "thong_hieu",
        content: `[Nhập từ ${fileType}: ${fileName}] Câu 2: Trong mặt phẳng tọa độ, véc tơ nào sau đây cùng phương với véc tơ u = (2; -3)?`,
        options: ["v = (-4; 6)", "v = (4; 6)", "v = (2; 3)", "v = (-2; -3)"],
        correctIndex: 0,
        explanation: "Véc tơ v = (-4; 6) = -2 * (2; -3) = -2 * u nên cùng phương với u.",
        imageUrl: ""
      }
    ];
  }
};
