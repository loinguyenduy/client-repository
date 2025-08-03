<template>
  <div class="profile-page">
    <div class="profile-container">
      <h2>User Profile</h2>
       <div v-if="!isEditingProfile" class="profile-display">
        <p><strong>Full Name:</strong> {{ userInfo?.fullName }}</p>
        <p><strong>Email:</strong> {{ userInfo?.email }}</p>
        <p><strong>Phone Number:</strong> {{ userInfo?.phoneNumber || 'N/A' }}</p>
        <p><strong>Address:</strong> {{ userInfo?.address || 'N/A' }}</p>
        <button @click="startEditingProfile" class="btn-edit-profile">Edit Profile</button>
      </div>

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
import Swal from 'sweetalert2'; 
export default {
  name: 'ProfilePage',
  data() {
    return {
      isEditingProfile: false, 
      editFullName: '',
      editEmail: '',
      editPhoneNumber: '',
      editAddress: '',
      
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',

      isLoadingProfileUpdate: false, 
      isLoadingPasswordChange: false, 
    };
  },
  computed: {
    ...mapGetters('user', ['getUserInfo']),
    
    userInfo() {
      return this.getUserInfo;
    }
  },
  watch: {
    userInfo: {
      handler(newVal) {
        if (newVal) {
          this.editFullName = newVal.fullName || '';
          this.editEmail = newVal.email || '';
          this.editPhoneNumber = newVal.phoneNumber || '';
          this.editAddress = newVal.address || '';
        }
      },
      immediate: true 
    }
  },
  async created() {
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
    ...mapActions('user', ['fetchUserProfile', 'updateProfile']), 
    startEditingProfile() {
      this.isEditingProfile = true;
      this.editFullName = this.userInfo.fullName;
      this.editEmail = this.userInfo.email;
      this.editPhoneNumber = this.userInfo.phoneNumber;
      this.editAddress = this.userInfo.address;
    },

    cancelEditingProfile() {
      this.isEditingProfile = false;
      if (this.userInfo) {
        this.editFullName = this.userInfo.fullName || '';
        this.editEmail = this.userInfo.email || '';
        this.editPhoneNumber = this.userInfo.phoneNumber || '';
        this.editAddress = this.userInfo.address || '';
      }
    },

    async updateUserProfile() {
      this.isLoadingProfileUpdate = true;

      try {
        const updatedData = {
          fullName: this.editFullName,
          email: this.editEmail,
          phoneNumber: this.editPhoneNumber,
          address: this.editAddress,
        };
        await this.updateProfile(updatedData); 
        Swal.fire({
          icon: 'success',
          title: 'Profile Updated!',
          text: 'Your profile has been updated successfully.',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          confirmButtonColor: '#A0522D',
        }).then(() => {
          this.isEditingProfile = false; 
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
        const passwordUpdateData = {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
        };
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
.profile-page {
  display: flex;
  justify-content: center;
  align-items: flex-start; 
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
  max-width: 600px; 
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
  background-color: #6c757d; 
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
