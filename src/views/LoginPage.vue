<!-- frontend/src/views/LoginPage.vue -->
<template>
  <div class="login-page">
    <div class="login-container">
      <h2>Login to Your Account</h2>
      <!-- Đã loại bỏ phần hiển thị thông báo lỗi thông thường, 
           vì SweetAlert2 sẽ xử lý điều này -->

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
import { mapActions } from "vuex";
import Swal from 'sweetalert2'; // Import SweetAlert2

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      isLoading: false,
      // Đã loại bỏ 'message' và 'messageType' vì SweetAlert2 sẽ xử lý
    };
  },
  methods: {
    ...mapActions("user", ["login"]),

    async submitLogin() {
      this.isLoading = true; // Bắt đầu loading

      try {
        // Gọi action 'login' từ Vuex store, truyền email và password
        await this.login({
          email: this.email,
          password: this.password,
        });

        // Hiển thị thông báo thành công bằng SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back! Redirecting to home page...',
          showConfirmButton: false, // Không hiển thị nút OK ngay lập tức
          timer: 2000, // Tự động đóng sau 2 giây
          timerProgressBar: true,
        }).then(() => {
          // Vuex action 'login' đã tự động chuyển hướng về trang chủ
          // hoặc trang mà người dùng muốn truy cập trước đó.
          // Tuy nhiên, để đảm bảo chuyển hướng sau khi SweetAlert đóng,
          // chúng ta có thể gọi router.push() ở đây.
          // Nếu bạn đã có logic redirect trong Vuex action, hãy cân nhắc
          // xem có cần dòng này không để tránh redirect kép.
          // Ví dụ: this.$router.push('/');
          // Để an toàn, chúng ta sẽ để Vuex xử lý redirect chính,
          // còn SweetAlert chỉ là thông báo.
        });

      } catch (err) {
        // Bắt lỗi được ném từ Vuex action và hiển thị cho người dùng bằng SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: err.message || 'An unexpected error occurred. Please try again.',
          confirmButtonColor: '#A0522D',
        });
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

/* Đã loại bỏ CSS cho .message vì SweetAlert2 sẽ xử lý */
</style>
