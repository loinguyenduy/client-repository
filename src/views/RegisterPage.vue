<!-- frontend/src/views/RegisterPage.vue -->
<template>
  <div class="register-page">
    <div class="register-container">
      <h2>Register Account</h2>
      <!-- Đã loại bỏ phần hiển thị thông báo lỗi/thành công thông thường, 
        vì SweetAlert2 sẽ xử lý điều này -->

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
import { mapActions } from 'vuex';
import Swal from 'sweetalert2'; // Import SweetAlert2

export default {
  name: 'RegisterPage',
  data() {
    return {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      address: '',
      isLoading: false,
      // Đã loại bỏ 'message' và 'messageType' vì SweetAlert2 sẽ xử lý
    };
  },
  methods: {
    ...mapActions('user', ['register']),

    async submitRegister() {
      this.isLoading = true; // Bắt đầu loading

      // Kiểm tra mật khẩu khớp nhau
      if (this.password !== this.confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: 'Passwords do not match.',
          confirmButtonColor: '#A0522D',
        });
        this.isLoading = false;
        return;
      }

      try {
        await this.register({
          fullName: this.fullName,
          email: this.email,
          password: this.password,
          phoneNumber: this.phoneNumber,
          address: this.address,
        });

        // Hiển thị thông báo thành công bằng SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Your account has been created. Redirecting to login page...',
          showConfirmButton: false, // Không hiển thị nút OK ngay lập tức
          timer: 2000, // Tự động đóng sau 2 giây
          timerProgressBar: true,
        }).then(() => {
          // Chuyển hướng đến trang đăng nhập sau khi alert đóng
          this.$router.push('/login');
        });

      } catch (err) {
        // Hiển thị thông báo lỗi bằng SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: err.message || 'An unexpected error occurred. Please try again.',
          confirmButtonColor: '#A0522D',
        });
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

/* Đã loại bỏ CSS cho .message và .message.error/.success vì SweetAlert2 sẽ xử lý */
</style>
