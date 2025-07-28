<!-- frontend/src/views/RegisterPage.vue -->
<template>
  <div class="register-page">
    <div class="register-container">
      <h2>Register Account</h2>
      <!-- Hiển thị thông báo lỗi hoặc thành công -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <form @submit.prevent="submitRegister" class="register-form">
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input type="text" id="fullName" v-model="fullName" required placeholder="Enter your full name" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="email" required placeholder="Enter your email" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" v-model="password" required placeholder="Enter your password" />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required placeholder="Confirm your password" />
        </div>

        <!-- Thêm trường Phone Number -->
        <div class="form-group">
          <label for="phoneNumber">Phone Number (Optional)</label>
          <input type="tel" id="phoneNumber" v-model="phoneNumber" placeholder="Enter your phone number" />
        </div>

        <!-- Thêm trường Address -->
        <div class="form-group">
          <label for="address">Address (Optional)</label>
          <input type="text" id="address" v-model="address" placeholder="Enter your address" />
        </div>

        <button type="submit" :disabled="isLoading" class="btn-register-submit">
          <span v-if="isLoading">Registering...</span>
          <span v-else>Register</span>
        </button>
      </form>

      <p class="login-link">
        Already have an account? <router-link to="/login">Login here</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'; // Import mapActions để gọi Vuex actions

export default {
  name: 'RegisterPage',
  data() {
    return {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '', // <-- Thêm trường này
      address: '',     // <-- Thêm trường này
      isLoading: false, // Trạng thái loading cho nút submit
      message: '',      // Thông báo lỗi/thành công
      messageType: ''   // Loại thông báo: 'success' hoặc 'error'
    };
  },
  methods: {
    // Ánh xạ action 'register' từ module 'user' của Vuex store
    ...mapActions('user', ['register']),

    async submitRegister() {
      this.isLoading = true; // Bắt đầu loading
      this.message = '';     // Xóa thông báo cũ
      this.messageType = '';

      // Kiểm tra mật khẩu khớp nhau
      if (this.password !== this.confirmPassword) {
        this.message = 'Passwords do not match.';
        this.messageType = 'error';
        this.isLoading = false;
        return; // Dừng hàm nếu mật khẩu không khớp
      }

      try {
        // Gọi action 'register' từ Vuex store, truyền dữ liệu người dùng
        await this.register({
          fullName: this.fullName,
          email: this.email,
          password: this.password,
          phoneNumber: this.phoneNumber, // <-- Truyền dữ liệu này
          address: this.address,         // <-- Truyền dữ liệu này
          // Backend sẽ tự động xử lý vai trò mặc định là 'user'
        });

        this.message = 'Registration successful! Redirecting to home page...';
        this.messageType = 'success';
        // Vuex action 'register' đã tự động chuyển hướng về trang chủ
        // nên không cần router.push ở đây
      } catch (err) {
        // Bắt lỗi được ném từ Vuex action và hiển thị cho người dùng
        this.message = err.message || 'Registration failed. Please try again.';
        this.messageType = 'error';
      } finally {
        this.isLoading = false; // Kết thúc loading
      }
    }
  }
};
</script>

<style scoped>
/* CSS cho trang đăng ký */
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px); /* Đảm bảo trang chiếm đủ chiều cao còn lại */
  background-color: var(--bg-light); /* Sử dụng biến màu nền từ App.vue */
  padding: 20px;
}

.register-container {
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.register-container h2 {
  color: var(--primary-color);
  margin-bottom: 30px;
  font-size: 2em;
  font-family: var(--font-family-heading);
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-color);
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group input[type="tel"] { /* <-- Thêm type="tel" vào đây */
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus {
  border-color: var(--primary-color);
  /* Sử dụng rgba với biến CSS nếu bạn đã định nghĩa biến màu RGB trong :root */
  /* Ví dụ: --primary-color-rgb: 160, 82, 45; */
  /* box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2); */
  box-shadow: 0 0 0 3px rgba(160, 82, 45, 0.2); /* Sử dụng giá trị RGB trực tiếp nếu không có biến */
  outline: none;
}

.btn-register-submit {
  background-color: var(--primary-color);
  color: #fff;
  padding: 15px 25px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%;
  margin-top: 10px;
}

.btn-register-submit:hover:not(:disabled) {
  background-color: darken(var(--primary-color), 10%);
  transform: translateY(-2px);
}

.btn-register-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.login-link {
  margin-top: 25px;
  color: var(--light-text-color);
}

.login-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

/* Thông báo lỗi/thành công */
.message {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-weight: 500;
  text-align: left;
}

.message.error {
  background-color: #ffe6e6; /* Màu nền đỏ nhạt */
  color: #cc0000; /* Màu chữ đỏ đậm */
  border: 1px solid #cc0000;
}

.message.success {
  background-color: #e6ffe6; /* Màu nền xanh lá nhạt */
  color: #008000; /* Màu chữ xanh lá đậm */
  border: 1px solid #008000;
}
</style>
