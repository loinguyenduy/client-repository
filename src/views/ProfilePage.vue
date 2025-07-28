<!-- frontend/src/views/ProfilePage.vue -->
<template>
  <div class="profile-page">
    <div class="profile-container">
      <h2>User Profile</h2>
      
      <!-- Hiển thị thông báo lỗi hoặc thành công -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

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
      message: '',                   // Thông báo lỗi/thành công
      messageType: ''                // Loại thông báo: 'success' hoặc 'error'
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
      this.message = err.message || 'Failed to load profile data.';
      this.messageType = 'error';
    } finally {
      this.isLoadingProfileUpdate = false;
    }
  },
  methods: {
    // Ánh xạ các actions từ module 'user' của Vuex store
    ...mapActions('user', ['fetchUserProfile', 'updateProfile']),

    // Bắt đầu chỉnh sửa hồ sơ: sao chép thông tin hiện tại vào form
    startEditingProfile() {
      this.isEditingProfile = true;
      this.editFullName = this.userInfo.fullName;
      this.editEmail = this.userInfo.email;
      this.editPhoneNumber = this.userInfo.phoneNumber;
      this.editAddress = this.userInfo.address;
      this.message = ''; // Xóa thông báo cũ
    },

    // Hủy chỉnh sửa hồ sơ
    cancelEditingProfile() {
      this.isEditingProfile = false;
      this.message = ''; // Xóa thông báo cũ
    },

    // Gửi yêu cầu cập nhật thông tin hồ sơ
    async updateUserProfile() {
      this.isLoadingProfileUpdate = true;
      this.message = '';
      this.messageType = '';

      try {
        const updatedData = {
          fullName: this.editFullName,
          email: this.editEmail,
          phoneNumber: this.editPhoneNumber,
          address: this.editAddress,
        };
        await this.updateProfile(updatedData); // Gọi action cập nhật profile
        this.message = 'Profile updated successfully!';
        this.messageType = 'success';
        this.isEditingProfile = false; // Tắt chế độ chỉnh sửa sau khi cập nhật
      } catch (err) {
        this.message = err.message || 'Failed to update profile. Please try again.';
        this.messageType = 'error';
      } finally {
        this.isLoadingProfileUpdate = false;
      }
    },

    // Gửi yêu cầu đổi mật khẩu
    async changePassword() {
      this.isLoadingPasswordChange = true;
      this.message = '';
      this.messageType = '';

      if (this.newPassword !== this.confirmNewPassword) {
        this.message = 'New passwords do not match.';
        this.messageType = 'error';
        this.isLoadingPasswordChange = false;
        return;
      }

      // Lưu ý: Backend của bạn cần có một API riêng để đổi mật khẩu,
      // thường là PUT /api/users/change-password hoặc tương tự.
      // API updateProfile hiện tại của bạn chỉ cập nhật thông tin khác, không phải mật khẩu.
      // Nếu API updateProfile của bạn hỗ trợ đổi mật khẩu, hãy truyền currentPassword và newPassword vào đó.
      // Nếu không, bạn cần tạo một action Vuex và API backend mới cho việc đổi mật khẩu.
      try {
        // Giả định backend có API để đổi mật khẩu và action Vuex tương ứng
        // await this.changeUserPassword({
        //   currentPassword: this.currentPassword,
        //   newPassword: this.newPassword,
        // });
        // Vì hiện tại chúng ta chưa có API/action đổi mật khẩu riêng, 
        // tôi sẽ chỉ mô phỏng thành công hoặc báo lỗi nếu không có API.
        
        // --- BẮT ĐẦU MÔ PHỎNG HOẶC GỌI API THỰC TẾ ---
        // Nếu backend của bạn có API đổi mật khẩu riêng, bạn sẽ gọi nó ở đây:
        // await apiClient.put('/users/change-password', {
        //   currentPassword: this.currentPassword,
        //   newPassword: this.newPassword,
        // });
        // Và bạn sẽ cần một action mới trong store.js (ví dụ: changeUserPassword)
        // để gọi API này.

        // Hiện tại, chúng ta sẽ giả định thành công hoặc báo lỗi nếu không có API
        // Nếu bạn đã có API đổi mật khẩu trong updateProfile, hãy dùng nó.
        // Nếu không, bạn cần thêm API và action riêng.
        // Ví dụ:
        const passwordUpdateData = {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
        };
        // Giả sử API updateProfile của bạn có thể xử lý đổi mật khẩu
        // Nếu không, bạn cần một API riêng cho đổi mật khẩu ở backend
        await this.updateProfile(passwordUpdateData); // <-- Cần đảm bảo backend xử lý được
        // --- KẾT THÚC MÔ PHỎNG HOẶC GỌI API THỰC TẾ ---


        this.message = 'Password changed successfully!';
        this.messageType = 'success';
        // Xóa các trường mật khẩu sau khi đổi thành công
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
      } catch (err) {
        this.message = err.message || 'Failed to change password. Please try again.';
        this.messageType = 'error';
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

/* Thông báo lỗi/thành công */
.message {
  padding: 12px;
  margin-bottom: 20px;
  border-radius: 8px;
  font-weight: 500;
  text-align: left;
}

.message.error {
  background-color: #ffe6e6;
  color: #cc0000;
  border: 1px solid #cc0000;
}

.message.success {
  background-color: #e6ffe6;
  color: #008000;
  border: 1px solid #008000;
}

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
