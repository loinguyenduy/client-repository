<template>
  <div class="register-page">
    <div class="register-container">
      <h2>Register Account</h2>
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
          <div class="password-input-wrapper">
            <input :type="passwordFieldType" id="password" v-model="password" required placeholder="Enter your password" />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="toggle-password"
            >
              {{ passwordVisible ? "Hide" : "Show" }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-input-wrapper">
            <input :type="confirmPasswordFieldType" id="confirmPassword" v-model="confirmPassword" required placeholder="Confirm your password" />
            <button
              type="button"
              @click="toggleConfirmPasswordVisibility"
              class="toggle-password"
            >
              {{ confirmPasswordVisible ? "Hide" : "Show" }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="phoneNumber">Phone Number (Optional)</label>
          <input type="tel" id="phoneNumber" v-model="phoneNumber" placeholder="Enter your phone number" />
        </div>

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
import Swal from 'sweetalert2'; 

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
      passwordVisible: false,
      confirmPasswordVisible: false, 
    };
  },
  computed: {
    passwordFieldType() {
      return this.passwordVisible ? 'text' : 'password';
    },
    confirmPasswordFieldType() {
      return this.confirmPasswordVisible ? 'text' : 'password';
    },
  },
  methods: {
    ...mapActions('user', ['register']),

    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    toggleConfirmPasswordVisibility() {
      this.confirmPasswordVisible = !this.confirmPasswordVisible;
    },
    async submitRegister() {
      this.isLoading = true; 

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

        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'Your account has been created. Redirecting to login page...',
          showConfirmButton: false, 
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          this.$router.push('/login');
        });

      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: err.message || 'An unexpected error occurred. Please try again.',
          confirmButtonColor: '#A0522D',
        });
      } finally {
        this.isLoading = false; 
      }
    }
  }
};
</script>

<style scoped>
.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 150px); 
  background-color: var(--bg-light); 
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
.form-group .password-input-wrapper input,
.form-group input[type="tel"] { 
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.password-input-wrapper input {
  padding-right: 70px;
}

.form-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(160, 82, 45, 0.2); 
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

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  color: var(--primary-color);
  font-weight: 600;
  font-size: 0.9em;
}

</style>
