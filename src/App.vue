<template>
  <div id="app">
    <header class="web-header">
      <nav class="container">
        <router-link to="/" class="brand-logo">
          <img src="@/assets/logo.png" alt="Restaurant Logo" class="logo-img" />
          <span class="brand-name">Viet Flavor</span>
        </router-link>

        <div class="nav-bar">
          <template v-if="!isAdmin">
            <router-link to="/" class="nav-item">Home</router-link>
            <router-link to="/menu" class="nav-item">Menu</router-link>
            <router-link to="/cart" class="nav-item">Cart</router-link>
            
            <router-link v-if="isLoggedIn" to="/orders/myorders" class="nav-item">My Orders</router-link>
          </template>

          <template v-if="!isLoggedIn">
            <router-link to="/login" class="btn-login">Login</router-link>
            <router-link to="/register" class="btn-register">Register</router-link>
          </template>
          <!-- Liên kết hiển thị khi người dùng ĐÃ đăng nhập -->
          <template v-else>
            <router-link to="/profile" class="nav-item user-profile-link">
              <i class="fas fa-user-circle user-icon"></i> <!-- Biểu tượng người dùng -->
              {{ userInfo?.fullName || 'Profile' }} <!-- Hiển thị tên đầy đủ hoặc 'Profile' -->
            </router-link>
            <!-- Liên kết Admin chỉ hiển thị nếu người dùng là Admin -->
            <router-link v-if="isAdmin" to="/admin/dashboard" class="nav-item btn-admin">Admin Management</router-link>
            <button @click="confirmLogout" class="nav-item btn-logout">Logout</button>
          </template>
        </div>
      </nav>
    </header>

    <main class="web-main">
      <router-view /> 
    </main>

    <footer class="web-footer">
      <div class="container footer-content">
        <div class="brand-info">
          <router-link to="/" class="brand-logo footer-logo">
            <img src="@/assets/logo.png" alt="Restaurant Logo" class="logo-img" />
            <span class="brand-name">Viet Flavor</span>
          </router-link>
          <p class="slogan">The essence of Vietnamese dishes, complete with love.</p>
          <p class="copyright">&copy; {{ currentYear }} Viet Flavor. All rights reserved.</p>
        </div>
        <div class="contact-info">
          <h3>Contact Us</h3>
          <p><i class="address-map"></i> 2 Pham Van Bach Street, Cau Giay District, Hanoi City</p>
          <p><i class="infor-phone"></i> +84 619 998 570</p>
          <p><i class="infor-email"></i> vietflavor@gmail.com</p>
        </div>

        <div class="opening-hours">
          <h3>Opening Hours</h3>
          <div class="hours-details">
            <p><strong>Monday - Friday:</strong> 11:00 AM - 10:00 PM</p>
            <p><strong>Saturday - Sunday:</strong> 12:00 PM - 11:00 PM</p>
            <p><i>Special Holiday Hours May Apply - Please Call Ahead </i></p>
          </div>
        </div>

        <div class="footer-section social-media">
          <h3>Follow Us</h3>
          <div class="social-icons">
            <a href="https://www.facebook.com/nguyen.duy.loi.206498" class="social-icon" target="_blank"><i class="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/nduyl_25/" class="social-icon" target="_blank"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-icon" target="_blank"><i class="fab fa-twitter"></i></a>
          </div>
        </div>

        <div class="footer-section footer-map">
          <h3>Find Us</h3>
          <div class="google-map-container-footer">
            <iframe
              width="100%"
              height="200"
              frameborder="0"
              style="border:0"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.2134973252655!2d105.78781021191256!3d21.024141787854322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab9f983e67af%3A0x41721163aff0f497!2sChung%20c%C6%B0%20Golden%20Park!5e0!3m2!1svi!2s!4v1752768721711!5m2!1svi!2s" 
            ></iframe>
          </div>
          <p class="map-note-footer">Click on the map for directions.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Swal from 'sweetalert2'; // Import SweetAlert2

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
    
    // Phương thức mới để xác nhận và xử lý đăng xuất
    async confirmLogout() {
      const result = await Swal.fire({
        title: 'Are you sure you want to log out?',
        text: 'You will be logged out of your account.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#A0522D', // Màu sắc nút xác nhận
        cancelButtonColor: '#6c757d', // Màu sắc nút hủy
        confirmButtonText: 'Yes, log me out!',
        cancelButtonText: 'Cancel',
      });

      if (result.isConfirmed) {
        try {
          await this.logout(); // Gọi action logout từ Vuex
          Swal.fire({
            icon: 'success',
            title: 'Logged Out!',
            text: 'You have been successfully logged out.',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            confirmButtonColor: '#A0522D',
          });
          this.$router.push('/'); // Chuyển hướng về trang chủ
        } catch (error) {
          console.error("Logout failed:", error);
          Swal.fire({
            icon: 'error',
            title: 'Logout Failed',
            text: error.message || 'There was an error logging you out. Please try again.',
            confirmButtonColor: '#A0522D',
          });
        }
      } else {
        console.log('Logout cancelled.');
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
.web-header {
  background-color: #fff;
  padding: 15px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky; /* Giữ header cố định khi cuộn */
  top: 0;
  z-index: 1000; /* Đảm bảo header nằm trên các nội dung khác */
}

.web-header .container {
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

.nav-bar {
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
  /* background-color: var(--primary-color); */
  color: var(--text-color); /* Đảm bảo màu chữ ban đầu là màu tối */
  padding: 8px 15px; /* Giữ padding để chúng trông như nút */
  border-radius: 5px;
  text-decoration: none;
  transition: all 0.3s ease; /* Sử dụng transition chung để chuyển đổi mượt mà */
  white-space: nowrap;
  border: 1px solid transparent; /* Border trong suốt ban đầu */
}

.btn-login:hover, .btn-register:hover {
  border: 1px solid var(--primary-color);
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
.web-main {
  flex-grow: 1;
  padding: 40px 0; /* Khoảng cách trên dưới cho nội dung chính */
  background-color: var(--bg-light);
}

/* --- Footer Styling --- */
.web-footer {
  background-color: var(--bg-dark);
  color: #fff;
  padding: 40px 0;
  font-size: 0.9em;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); /* Chia cột responsive */
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
  font-size: 24px;
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

.footer-map {
  /* Đảm bảo nó chiếm không gian hợp lý trong grid */
  /* Có thể điều chỉnh flex-basis hoặc max-width nếu cần */
}

.google-map-container-footer {
  width: 100%;
  border-radius: 8px; /* Bo tròn góc cho container map */
  overflow: hidden; /* Đảm bảo iframe không tràn ra ngoài */
  box-shadow: 0 2px 10px rgba(0,0,0,0.2); /* Bóng cho map */
  margin-top: 10px; /* Khoảng cách với tiêu đề "Find Us" */
}

.google-map-container-footer iframe {
  border-radius: 8px; /* Áp dụng border-radius cho iframe */
  display: block; /* Loại bỏ khoảng trắng dưới iframe */
}

.map-note-footer {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 10px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .web-header .container {
    flex-direction: column;
    gap: 15px;
  }

  .nav-bar {
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
