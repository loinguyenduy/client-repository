<!-- frontend/src/views/LoginPage.vue -->
<template>
  <div class="login-page">
    <div class="login-container">
      <h2>Login to Your Account</h2>
      <!-- Hiển thị thông báo lỗi -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <form @submit.prevent="submitLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" :disabled="isLoading" class="btn-login-submit">
          <span v-if="isLoading">Logging In...</span>
          <span v-else>Login</span>
        </button>
      </form>

      <p class="register-link">
        Don't have an account?
        <router-link to="/register">Register here</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex"; // Import mapActions để gọi Vuex actions

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      isLoading: false, // Trạng thái loading cho nút submit
      message: "", // Thông báo lỗi
      messageType: "", // Loại thông báo: 'error'
    };
  },
  methods: {
    // Ánh xạ action 'login' từ module 'user' của Vuex store
    ...mapActions("user", ["login"]),

    async submitLogin() {
      this.isLoading = true; // Bắt đầu loading
      this.message = ""; // Xóa thông báo cũ
      this.messageType = "";

      try {
        // Gọi action 'login' từ Vuex store, truyền email và password
        await this.login({
          email: this.email,
          password: this.password,
        });

        // Nếu login thành công, Vuex action 'login' đã tự động chuyển hướng
        // về trang chủ hoặc trang mà người dùng muốn truy cập trước đó.
        // Không cần router.push ở đây.
      } catch (err) {
        // Bắt lỗi được ném từ Vuex action và hiển thị cho người dùng
        this.message = err.message || "Login failed. Please try again.";
        this.messageType = "error";
      } finally {
        this.isLoading = false; // Kết thúc loading
      }
    },
  },
};
</script>

<style scoped>
/* CSS cho trang đăng nhập */
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(
    100vh - 150px
  ); /* Đảm bảo trang chiếm đủ chiều cao còn lại */
  background-color: var(--bg-light); /* Sử dụng biến màu nền từ App.vue */
  padding: 20px;
}

.login-container {
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.login-container h2 {
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

.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(160, 82, 45, 0.2); /* Sử dụng giá trị RGB trực tiếp nếu không có biến */
  outline: none;
}

.btn-login-submit {
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

.btn-login-submit:hover:not(:disabled) {
  background-color: darken(var(--primary-color), 10%);
  transform: translateY(-2px);
}

.btn-login-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.register-link {
  margin-top: 25px;
  color: var(--light-text-color);
}

.register-link a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

/* Thông báo lỗi */
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
</style>
