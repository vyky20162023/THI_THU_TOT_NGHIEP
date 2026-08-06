/**
 * AUTH.JS - Authentication & Profile Management
 * Đăng ký, đăng nhập, phân quyền Học sinh / Giáo viên / Admin, cập nhật hồ sơ
 */

const Auth = {
  // Lấy thông tin user hiện tại đang đăng nhập
  getCurrentUser() {
    return Store.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER) || null;
  },

  // Đăng nhập
  login(username, password) {
    const users = Store.getItem(CONFIG.STORAGE_KEYS.USERS) || [];
    const found = users.find(u => u.username === username && u.password === password);
    
    if (found) {
      Store.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, found);
      return { success: true, user: found };
    }
    return { success: false, message: "Tên đăng nhập hoặc mật khẩu không chính xác!" };
  },

  // Nhanh chóng chuyển đổi Role cho việc Demo/Test
  switchRole(role) {
    const users = Store.getItem(CONFIG.STORAGE_KEYS.USERS) || [];
    const userWithRole = users.find(u => u.role === role);
    if (userWithRole) {
      Store.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, userWithRole);
      return userWithRole;
    }
    return null;
  },

  // Đăng ký tài khoản học sinh mới
  register(data) {
    const users = Store.getItem(CONFIG.STORAGE_KEYS.USERS) || [];
    
    if (users.some(u => u.username === data.username)) {
      return { success: false, message: "Tên đăng nhập đã tồn tại!" };
    }

    const newUser = {
      id: "usr_" + Date.now(),
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      email: data.email || `${data.username}@edutest.vn`,
      role: data.role || "student",
      grade: data.grade || "12",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username}`,
      badges: ["b1"],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    Store.setItem(CONFIG.STORAGE_KEYS.USERS, users);
    Store.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, newUser);

    return { success: true, user: newUser };
  },

  // Cập nhật hồ sơ cá nhân
  updateProfile(updatedData) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return { success: false, message: "Chưa đăng nhập!" };

    const users = Store.getItem(CONFIG.STORAGE_KEYS.USERS) || [];
    const index = users.findIndex(u => u.id === currentUser.id);

    if (index !== -1) {
      users[index] = { ...users[index], ...updatedData };
      Store.setItem(CONFIG.STORAGE_KEYS.USERS, users);
      Store.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, users[index]);
      return { success: true, user: users[index] };
    }

    return { success: false, message: "Không tìm thấy người dùng!" };
  },

  // Đăng xuất
  logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
  }
};
