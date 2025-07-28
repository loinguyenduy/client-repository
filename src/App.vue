<template>
  <div id="app">
    <header class="app-header">
      <nav class="container">
        <router-link to="/" class="brand-logo">
          <img src="@/assets/logo.png" alt="Restaurant Logo" class="logo-img" />
          <span class="brand-name">Viet Flavor
</span>
        </router-link>

        <div class="nav-links">
          <template v-if="!isAdmin">
            <router-link to="/" class="nav-item">Home</router-link>
            <router-link to="/menu" class="nav-item">Menu</router-link>
            <router-link to="/cart" class="nav-item">Cart</router-link>
            
            <router-link v-if="isLoggedIn" to="/orders/myorders" class="nav-item">My Orders</router-link>
          </template>

          <template v-if="!isLoggedIn">
            <router-link to="/login" class="nav-item btn-login">Login</router-link>
            <router-link to="/register" class="nav-item btn-register">Register</router-link>
          </template>
          <!-- Liên kết hiển thị khi người dùng ĐÃ đăng nhập -->
          <template v-else>
            <router-link to="/profile" class="nav-item user-profile-link">
              <i class="fas fa-user-circle user-icon"></i> <!-- Biểu tượng người dùng -->
              {{ userInfo?.fullName || 'Profile' }} <!-- Hiển thị tên đầy đủ hoặc 'Profile' -->
            </router-link>
            <!-- Liên kết Admin chỉ hiển thị nếu người dùng là Admin -->
            <router-link v-if="isAdmin" to="/admin/products" class="nav-item btn-admin">Admin Management</router-link>
            <button @click="handleLogout" class="nav-item btn-logout">Logout</button>
          </template>
        </div>
      </nav>
    </header>

    <main class="app-main">
      <router-view /> <!-- Nơi nội dung của các trang con sẽ được hiển thị -->
    </main>

    <footer class="app-footer">
      <div class="container footer-content">
        <div class="footer-section brand-info">
          <router-link to="/" class="brand-logo footer-logo">
            <img src="@/assets/logo.png" alt="Restaurant Logo" class="logo-img" />
            <span class="brand-name">Viet Flavor</span>
          </router-link>
          <p class="slogan">Where flavor meets art.</p>
          <p class="copyright">&copy; {{ currentYear }} Viet Flavor. All rights reserved.</p>
        </div>

        <!-- <div class="footer-section quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><router-link to="/about" class="footer-link">About Us</router-link></li>
            <li><router-link to="/contact" class="footer-link">Contact Us</router-link></li>
            <li><router-link to="/privacy" class="footer-link">Privacy Policy</router-link></li>
            <li><router-link to="/terms" class="footer-link">Terms of Service</router-link></li>
          </ul>
        </div> -->

        <div class="footer-section contact-info">
          <h3>Contact Us</h3>
          <p><i class="fas fa-map-marker-alt"></i> 123 ABC Street, XYZ District, HCMC</p>
          <p><i class="fas fa-phone"></i> +84 123 456 789</p>
          <p><i class="fas fa-envelope"></i> vietflavor@gmail.com</p>
          <p><i class="fas fa-clock"></i> Opening Hours: Mon-Fri: 9:00-22:00, Weekends: 10:00-23:00</p>
        </div>

        <div class="footer-section social-media">
          <h3>Follow Us</h3>
          <div class="social-icons">
            <a href="https://www.facebook.com/nguyen.duy.loi.206498" class="social-icon"><i class="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/nduyl_25/" class="social-icon"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'App',
  computed: {
    // Ánh xạ các getters từ module 'user' của Vuex store
    ...mapGetters('user', ['isLoggedIn', 'userRole', 'getUserInfo', 'isAdmin']), // Đã thêm 'isAdmin'
    
    // Lấy thông tin người dùng để hiển thị tên
    userInfo() {
      return this.getUserInfo;
    },
    // Computed property để lấy năm hiện tại cho footer
    currentYear() {
      return new Date().getFullYear();
    },
  },
  methods: {
    // Ánh xạ action 'logout' từ module 'user' của Vuex store
    ...mapActions('user', ['logout']),
    
    // Xử lý sự kiện click cho nút Đăng xuất
    async handleLogout() {
      try {
        await this.logout(); // Gọi action logout từ Vuex
      } catch (error) {
        console.error("Logout failed:", error);
        alert("An error occurred during logout. Please try again."); // Thông báo lỗi bằng tiếng Anh
      }
    }
  },
  watch: {
    isLoggedIn(newVal) {
      console.log('App.vue: isLoggedIn changed to:', newVal); // Debug log
    }
  }
}
</script>

<style>
/* Import Font Awesome cho các biểu tượng (icons) */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

/* CSS toàn cục và các biến CSS */
:root {
  --primary-color: #A0522D; /* Màu nâu đất ấm áp */
  --accent-color: #FFD700; /* Màu vàng đồng để làm nổi bật */
  --text-color: #333;
  --light-text-color: #666;
  --bg-light: #FDF5E6; /* Màu nền kem nhạt */
  --bg-dark: #2C3E50; /* Màu nền tối cho footer */
  --border-color: #E0E0E0;
  --font-family-primary: 'Roboto', sans-serif;
  --font-family-heading: 'Playfair Display', serif; /* Font chữ nghệ thuật cho tiêu đề/logo */
}

/* Reset CSS cơ bản */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family-primary);
  color: var(--text-color);
  line-height: 1.6;
  background-color: var(--bg-light);
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* --- Header Styling --- */
.app-header {
  background-color: #fff;
  padding: 15px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky; /* Giữ header cố định khi cuộn */
  top: 0;
  z-index: 1000; /* Đảm bảo header nằm trên các nội dung khác */
}

.app-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--primary-color);
  font-family: var(--font-family-heading);
  font-size: 1.8em;
  font-weight: bold;
}

.brand-logo .logo-img {
  height: 80px; /* Kích thước logo */
  margin-right: 10px;
  border-radius: 50%; /* Bo tròn logo nếu là hình ảnh */
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 25px; /* Khoảng cách giữa các liên kết */
}

.nav-item {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 5px;
  transition: all 0.3s ease;
  white-space: nowrap; /* Ngăn không cho chữ xuống dòng */
}

.nav-item:hover {
  background-color: var(--primary-color);
  color: #fff;
}

.nav-item.router-link-exact-active {
  color: var(--primary-color);
  font-weight: bold;
}

/* Nút Đăng nhập/Đăng ký */
.btn-login, .btn-register {
  background-color: var(--primary-color);
  color: #fff;
  border: 1px solid var(--primary-color);
  padding: 8px 15px;
  border-radius: 5px;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.btn-login:hover, .btn-register:hover {
  background-color: darken(var(--primary-color), 10%); /* Làm tối màu khi hover */
  color: #fff;
}

/* Link Hồ sơ người dùng */
.user-profile-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
  font-weight: bold;
}

.user-profile-link .user-icon {
  font-size: 1.2em;
  color: var(--accent-color);
}

/* Nút Admin */
.btn-admin {
  background-color: var(--accent-color);
  color: var(--text-color);
  border: 1px solid var(--accent-color);
  font-weight: bold;
}

.btn-admin:hover {
  background-color: darken(var(--accent-color), 10%);
}

/* Nút Đăng xuất */
.btn-logout {
  background: none;
  border: 1px solid var(--light-text-color);
  color: var(--light-text-color);
  cursor: pointer;
  font-weight: 500;
}

.btn-logout:hover {
  background-color: var(--light-text-color);
  color: #fff;
}

/* --- Main Content Styling --- */
.app-main {
  flex-grow: 1;
  padding: 40px 0; /* Khoảng cách trên dưới cho nội dung chính */
  background-color: var(--bg-light);
}

/* --- Footer Styling --- */
.app-footer {
  background-color: var(--bg-dark);
  color: #fff;
  padding: 40px 0;
  font-size: 0.9em;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Chia cột responsive */
  gap: 30px;
  text-align: left;
}

.footer-section h3 {
  color: var(--accent-color);
  margin-bottom: 15px;
  font-size: 1.1em;
  font-family: var(--font-family-heading);
}

.footer-section p {
  margin-bottom: 10px;
  color: rgba(255, 255, 255, 0.8);
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--accent-color);
}

.footer-logo {
  color: #fff;
  margin-bottom: 15px;
}

.footer-logo .brand-name {
  color: #fff;
}

.slogan {
  font-style: italic;
  font-size: 1.1em;
  margin-bottom: 15px;
}

.copyright {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 20px;
}

.contact-info p {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-info i {
  color: var(--accent-color);
  font-size: 1.1em;
}

.social-icons {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.social-icon {
  color: #fff;
  font-size: 1.5em;
  transition: color 0.3s ease;
}

.social-icon:hover {
  color: var(--accent-color);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .app-header .container {
    flex-direction: column;
    gap: 15px;
  }

  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .footer-content {
    grid-template-columns: 1fr; /* Một cột trên màn hình nhỏ */
    text-align: center;
  }

  .footer-section.brand-info,
  .footer-section.quick-links,
  .footer-section.contact-info,
  .footer-section.social-media {
    margin-bottom: 20px;
  }

  .social-icons {
    justify-content: center;
  }
}
</style>
