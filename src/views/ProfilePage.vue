<!-- frontend/src/views/ProfilePage.vue -->
<template>
  <div class="profile-page">
    <div class="profile-container">
      <h2>User Profile</h2>
      
      <!-- Đã loại bỏ phần hiển thị thông báo lỗi hoặc thành công thông thường, 
           vì SweetAlert2 sẽ xử lý điều này -->

      <!-- Phần hiển thị thông tin hồ sơ -->
      <div v-if="!isEditingProfile" class="profile-display">
        <p><strong>Full Name:</strong> {{ userInfo?.fullName }}</p>
        <p><strong>Email:</strong> {{ userInfo?.email }}</p>
        <p><strong>Phone Number:</strong> {{ userInfo?.phoneNumber || 'N/A' }}</p>
        <p><strong>Address:</strong> {{ userInfo?.address || 'N/A' }}</p>
        <button @click="startEditingProfile" class="btn-edit-profile">Edit Profile</button>
      </div>

      <!-- Phần chỉnh sửa thông tin hồ sơ -->
      <form v-else @submit.prevent="updateUserProfile" class="profile-form">
        <h3>Edit Profile Information</h3>
        <div class="form-group">
          <label for="editFullName">Full Name</label>
          <input type="text" id="editFullName" v-model="editFullName" required />
        </div>
        <div class="form-group">
          <label for="editEmail">Email</label>
          <input type="email" id="editEmail" v-model="editEmail" required />
        </div>
        <div class="form-group">
          <label for="editPhoneNumber">Phone Number</label>
          <input type="tel" id="editPhoneNumber" v-model="editPhoneNumber" />
        </div>
        <div class="form-group">
          <label for="editAddress">Address</label>
          <input type="text" id="editAddress" v-model="editAddress" />
        </div>
        <button type="submit" :disabled="isLoadingProfileUpdate" class="btn-save-profile">
          <span v-if="isLoadingProfileUpdate">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
        <button type="button" @click="cancelEditingProfile" class="btn-cancel-edit">Cancel</button>
      </form>

      <hr class="section-divider" />

      <!-- Phần đổi mật khẩu -->
      <h3>Change Password</h3>
      <form @submit.prevent="changePassword" class="password-form">
        <div class="form-group">
          <label for="currentPassword">Current Password</label>
          <input type="password" id="currentPassword" v-model="currentPassword" required />
        </div>
        <div class="form-group">
          <label for="newPassword">New Password</label>
          <input type="password" id="newPassword" v-model="newPassword" required />
        </div>
        <div class="form-group">
          <label for="confirmNewPassword">Confirm New Password</label>
          <input type="password" id="confirmNewPassword" v-model="confirmNewPassword" required />
        </div>
        <button type="submit" :disabled="isLoadingPasswordChange" class="btn-change-password">
          <span v-if="isLoadingPasswordChange">Changing...</span>
          <span v-else>Change Password</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Swal from 'sweetalert2'; // Import SweetAlert2

export default {
  name: 'ProfilePage',
  data() {
    return {
      isEditingProfile: false, // Trạng thái chỉnh sửa thông tin hồ sơ
      editFullName: '',
      editEmail: '',
      editPhoneNumber: '',
      editAddress: '',
      
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',

      isLoadingProfileUpdate: false, // Trạng thái loading khi cập nhật profile
      isLoadingPasswordChange: false, // Trạng thái loading khi đổi mật khẩu
      // Đã xóa: message: '',
      // Đã xóa: messageType: ''
    };
  },
  computed: {
    // Ánh xạ các getters từ module 'user' của Vuex store
    ...mapGetters('user', ['getUserInfo']),
    
    // Lấy thông tin người dùng từ store
    userInfo() {
      return this.getUserInfo;
    }
  },
  watch: {
    // Theo dõi thay đổi của userInfo để cập nhật form chỉnh sửa khi dữ liệu được fetch
    userInfo: {
      handler(newVal) {
        if (newVal) {
          this.editFullName = newVal.fullName || '';
          this.editEmail = newVal.email || '';
          this.editPhoneNumber = newVal.phoneNumber || '';
          this.editAddress = newVal.address || '';
        }
      },
      immediate: true // Chạy handler ngay lập tức khi component được tạo
    }
  },
  async created() {
    // Khi component được tạo, cố gắng fetch thông tin profile mới nhất từ backend
    // Điều này đảm bảo dữ liệu hiển thị luôn được đồng bộ
    this.isLoadingProfileUpdate = true;
    try {
      await this.fetchUserProfile();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Profile',
        text: err.message || 'Failed to load profile data. Please try again.',
        confirmButtonColor: '#A0522D',
      });
    } finally {
      this.isLoadingProfileUpdate = false;
    }
  },
  methods: {
    // Ánh xạ các actions từ module 'user' của Vuex store
    ...mapActions('user', ['fetchUserProfile', 'updateProfile']), // Giả định updateProfile có thể xử lý cả thông tin và mật khẩu

    // Bắt đầu chỉnh sửa hồ sơ: sao chép thông tin hiện tại vào form
    startEditingProfile() {
      this.isEditingProfile = true;
      this.editFullName = this.userInfo.fullName;
      this.editEmail = this.userInfo.email;
      this.editPhoneNumber = this.userInfo.phoneNumber;
      this.editAddress = this.userInfo.address;
    },

    // Hủy chỉnh sửa hồ sơ
    cancelEditingProfile() {
      this.isEditingProfile = false;
      // Reset form chỉnh sửa về trạng thái ban đầu của userInfo
      if (this.userInfo) {
        this.editFullName = this.userInfo.fullName || '';
        this.editEmail = this.userInfo.email || '';
        this.editPhoneNumber = this.userInfo.phoneNumber || '';
        this.editAddress = this.userInfo.address || '';
      }
    },

    // Gửi yêu cầu cập nhật thông tin hồ sơ
    async updateUserProfile() {
      this.isLoadingProfileUpdate = true;

      try {
        const updatedData = {
          fullName: this.editFullName,
          email: this.editEmail,
          phoneNumber: this.editPhoneNumber,
          address: this.editAddress,
        };
        await this.updateProfile(updatedData); // Gọi action cập nhật profile
        
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated!',
          text: 'Your profile has been updated successfully.',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          confirmButtonColor: '#A0522D',
        }).then(() => {
          this.isEditingProfile = false; // Tắt chế độ chỉnh sửa sau khi cập nhật
        });

      } catch (err) {
        console.error('Error updating profile:', err);
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: err.message || 'Failed to update profile. Please try again.',
          confirmButtonColor: '#A0522D',
        });
      } finally {
        this.isLoadingProfileUpdate = false;
      }
    },

    // Gửi yêu cầu đổi mật khẩu
    async changePassword() {
      this.isLoadingPasswordChange = true;

      if (this.newPassword !== this.confirmNewPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Password Mismatch',
          text: 'New passwords do not match.',
          confirmButtonColor: '#A0522D',
        });
        this.isLoadingPasswordChange = false;
        return;
      }

      try {
        // Giả định backend có API để đổi mật khẩu và action Vuex tương ứng
        // Nếu API `updateProfile` của bạn có thể xử lý đổi mật khẩu, hãy truyền dữ liệu vào đó.
        // Nếu không, bạn cần một action Vuex và API backend riêng cho việc đổi mật khẩu.
        // Ví dụ:
        const passwordUpdateData = {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
        };
        // Gọi action Vuex để đổi mật khẩu.
        // Đây là một giả định, bạn cần đảm bảo action 'updateProfile' hoặc một action khác
        // trong Vuex store của bạn có thể xử lý việc đổi mật khẩu.
        await this.updateProfile(passwordUpdateData); 

        Swal.fire({
          icon: 'success',
          title: 'Password Changed!',
          text: 'Your password has been changed successfully.',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          confirmButtonColor: '#A0522D',
        });

        // Xóa các trường mật khẩu sau khi đổi thành công
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      } catch (err) {
        console.error('Error changing password:', err);
        Swal.fire({
          icon: 'error',
          title: 'Change Failed',
          text: err.message || 'Failed to change password. Please try again.',
          confirmButtonColor: '#A0522D',
        });
      } finally {
        this.isLoadingPasswordChange = false;
      }
    }
  }
};
</script>

<style scoped>
/* CSS cho trang hồ sơ */
.profile-page {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Căn trên để nội dung không bị dồn giữa nếu ít */
  min-height: calc(100vh - 150px);
  background-color: var(--bg-light);
  padding: 40px 20px;
}

.profile-container {
  background-color: #fff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px; /* Tăng chiều rộng tối đa */
  text-align: center;
}

.profile-container h2 {
  color: var(--primary-color);
  margin-bottom: 30px;
  font-size: 2.2em;
  font-family: var(--font-family-heading);
}

.profile-container h3 {
  color: var(--text-color);
  margin-top: 30px;
  margin-bottom: 20px;
  font-size: 1.5em;
  font-family: var(--font-family-heading);
}

/* Đã xóa CSS cho .message */

/* Phần hiển thị thông tin */
.profile-display {
  text-align: left;
  margin-bottom: 30px;
}

.profile-display p {
  font-size: 1.1em;
  margin-bottom: 10px;
  color: var(--light-text-color);
}

.profile-display p strong {
  color: var(--text-color);
}

.btn-edit-profile {
  background-color: var(--primary-color);
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 15px;
}

.btn-edit-profile:hover {
  background-color: darken(var(--primary-color), 10%);
}

/* Form chỉnh sửa profile và đổi mật khẩu */
.profile-form, .password-form {
  text-align: left;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--text-color);
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group input[type="password"] {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(160, 82, 45, 0.2);
  outline: none;
}

.btn-save-profile, .btn-change-password {
  background-color: var(--primary-color);
  color: #fff;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 10px;
  margin-right: 10px;
}

.btn-save-profile:hover:not(:disabled), .btn-change-password:hover:not(:disabled) {
  background-color: darken(var(--primary-color), 10%);
  transform: translateY(-2px);
}

.btn-save-profile:disabled, .btn-change-password:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-cancel-edit {
  background-color: #6c757d; /* Màu xám */
  color: #fff;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.btn-cancel-edit:hover {
  background-color: darken(#6c757d, 10%);
}

.section-divider {
  border: 0;
  height: 1px;
  background-color: var(--border-color);
  margin: 40px 0;
}
</style>
