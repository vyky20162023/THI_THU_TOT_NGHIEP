/**
 * ANTI_CHEAT_ENGINE.JS - Multi-Layer Anti-Cheat Security System
 * Giám sát thi thử: Fullscreen, Chống Copy/Paste, Phát hiện chuyển Tab & Tự động nộp bài khi vi phạm
 */

const AntiCheatEngine = {
  isActive: false,
  violationsCount: 0,
  maxViolations: CONFIG.ANTI_CHEAT.MAX_TAB_VIOLATIONS,
  onViolationCallback: null,
  onAutoSubmitCallback: null,

  // Kích hoạt chế độ chống gian lận
  start(onViolation, onAutoSubmit) {
    this.isActive = true;
    this.violationsCount = 0;
    this.onViolationCallback = onViolation;
    this.onAutoSubmitCallback = onAutoSubmit;

    this.bindEvents();
    this.requestFullscreen();
    console.log("🔒 Anti-Cheat Engine Activated!");
  },

  // Tắt chế độ chống gian lận
  stop() {
    this.isActive = false;
    this.unbindEvents();
    this.exitFullscreen();
    console.log("🔓 Anti-Cheat Engine Deactivated!");
  },

  // Đăng ký các sự kiện bảo vệ
  bindEvents() {
    // 1. Chống Copy / Cut / Paste / Context Menu
    document.addEventListener("copy", this.preventAction);
    document.addEventListener("cut", this.preventAction);
    document.addEventListener("paste", this.preventAction);
    document.addEventListener("contextmenu", this.preventAction);
    document.addEventListener("selectstart", this.preventAction);

    // 2. Chống phím tắt F12, Ctrl+C, Ctrl+V, Ctrl+U, Alt+Tab
    window.addEventListener("keydown", this.handleKeyDown);

    // 3. Phát hiện chuyển Tab hoặc Rời cửa sổ
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    window.addEventListener("blur", this.handleWindowBlur);
  },

  // Gỡ bỏ các sự kiện
  unbindEvents() {
    document.removeEventListener("copy", this.preventAction);
    document.removeEventListener("cut", this.preventAction);
    document.removeEventListener("paste", this.preventAction);
    document.removeEventListener("contextmenu", this.preventAction);
    document.removeEventListener("selectstart", this.preventAction);

    window.removeEventListener("keydown", this.handleKeyDown);

    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    window.removeEventListener("blur", this.handleWindowBlur);
  },

  // Vô hiệu hóa hành động không được phép
  preventAction(e) {
    if (!AntiCheatEngine.isActive) return;
    e.preventDefault();
    e.stopPropagation();
    AntiCheatEngine.showToast("⚠️ Thao tác Copy/Paste/Chuột phải bị vô hiệu hóa trong lúc làm bài thi!");
    return false;
  },

  // Kiểm tra và ngăn chặn các phím tắt can thiệp
  handleKeyDown(e) {
    if (!AntiCheatEngine.isActive) return;

    // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+C, Ctrl+V, Alt+Tab
    if (
      e.keyCode === 123 || // F12
      (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Inspect
      (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 67 || e.keyCode === 86 || e.keyCode === 65)) // Ctrl+U, C, V, A
    ) {
      e.preventDefault();
      AntiCheatEngine.showToast("⚠️ Chức năng phím tắt này bị cấm khi đang thi!");
      return false;
    }
  },

  // Xử lý khi thí sinh ẩn trang / chuyển sang ứng dụng khác
  handleVisibilityChange() {
    if (!AntiCheatEngine.isActive) return;

    if (document.hidden) {
      AntiCheatEngine.registerViolation("Chuyển Tab / Ẩn cửa sổ trình duyệt");
    }
  },

  // Xử lý khi mất Focus cửa sổ
  handleWindowBlur() {
    if (!AntiCheatEngine.isActive) return;
    // Debounce ngắn để tránh false positive khi tương tác UI
    setTimeout(() => {
      if (document.activeElement && document.activeElement.tagName === "IFRAME") return;
      if (!document.hasFocus() && AntiCheatEngine.isActive) {
        AntiCheatEngine.registerViolation("Rời khỏi cửa sổ bài thi");
      }
    }, 300);
  },

  // Ghi nhận vi phạm & Cảnh báo
  registerViolation(reason) {
    this.violationsCount++;
    console.warn(`[Anti-Cheat Breach #${this.violationsCount}]: ${reason}`);

    if (this.onViolationCallback) {
      this.onViolationCallback(this.violationsCount, this.maxViolations, reason);
    }

    if (this.violationsCount >= this.maxViolations) {
      this.showToast("🚨 Bạn đã vi phạm chống gian lận quá 3 lần! Hệ thống tự động nộp bài.");
      if (this.onAutoSubmitCallback) {
        this.onAutoSubmitCallback();
      }
    } else {
      this.showToast(`🚨 CẢNH BÁO GIAN LẬN (${this.violationsCount}/${this.maxViolations}): ${reason}`);
    }
  },

  // Ép bật Toàn màn hình (Fullscreen)
  requestFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log("Fullscreen request declined"));
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  },

  // Thoát toàn màn hình khi nộp bài
  exitFullscreen() {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  },

  // Hiển thị thông báo Toast cảnh báo
  showToast(message) {
    let toast = document.getElementById("anticheat-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "anticheat-toast";
      toast.className = "anticheat-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }
};
