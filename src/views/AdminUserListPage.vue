<!-- frontend/src/views/AdminUserListPage.vue -->
<template>
  <div class="admin-user-list-page">
    <div class="container">
      <h1>User Management</h1>

      <!-- Hiển thị thông báo loading hoặc lỗi -->
      <div v-if="isLoading" class="loading-spinner">Loading users...</div>
      <div v-else-if="error" class="error-message">
        {{ error }}
        <router-link to="/admin/dashboard" class="btn-back-dashboard">Back to Dashboard</router-link>
      </div>
      <div v-else-if="users.length === 0 && !isLoading" class="no-users-message">
        No users found in the system.
      </div>

      <!-- Bảng danh sách người dùng -->
      <div v-else class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user._id }}</td>
              <td>{{ user.fullName }}</td>
              <td>{{ user.email }}</td>
              <td>
                <select 
                  v-model="user.role" 
                  @change="updateUserRole(user._id, user.role)"
                  :disabled="user._id === currentAdminId"
                  :class="['role-select', user.role]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td class="actions-cell">
                <button 
                  @click="confirmDelete(user._id)" 
                  :disabled="user._id === currentAdminId"
                  class="btn-action btn-delete"
                >
                  <i class="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/helpers/api';
import { mapGetters } from 'vuex';
import Swal from 'sweetalert2'; // Import SweetAlert2

export default {
  name: 'AdminUserListPage',
  data() {
    return {
      users: [],
      isLoading: true,
      error: null,
    };
  },
  computed: {
    ...mapGetters('user', ['isAdmin', 'getUserInfo']),
    currentAdminId() {
      return this.getUserInfo?._id || null; // Lấy ID của admin hiện tại
    }
  },
  async created() {
    // Kiểm tra quyền admin
    if (!this.isAdmin) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized Access',
        text: 'You are not authorized to view this page. Admin access required.',
        confirmButtonColor: '#A0522D',
      }).then(() => {
        this.$router.push('/');
      });
      return;
    }
    await this.fetchAllUsers();
  },
  methods: {
    // Lấy tất cả người dùng từ backend
    async fetchAllUsers() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/admin/users');
        this.users = response.data;
      } catch (err) {
        console.error('Error fetching users:', err); // Giữ console.error cho debug
        this.error = err.response?.data?.message || 'Failed to load users. Server error.';
        this.users = [];
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Users',
          text: this.error,
          confirmButtonColor: '#A0522D',
        });
      } finally {
        this.isLoading = false;
      }
    },

    // Cập nhật vai trò người dùng
    async updateUserRole(userId, newRole) {
      // Ngăn admin tự hạ quyền của mình
      if (userId === this.currentAdminId && newRole !== 'admin') {
        Swal.fire({
          icon: 'warning',
          title: 'Action Not Allowed',
          text: 'You cannot downgrade your own role!',
          confirmButtonColor: '#A0522D',
        });
        // Fetch lại để khôi phục trạng thái cũ trên UI
        await this.fetchAllUsers(); 
        return;
      }

      this.isLoading = true; // Có thể hiển thị loading cho từng dòng
      this.error = null;
      try {
        await apiClient.put(`/admin/users/${userId}`, { role: newRole }); // Gọi API updateUser
        Swal.fire({
          icon: 'success',
          title: 'Role Updated!',
          text: `User role for ${userId} updated to ${newRole}.`,
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          confirmButtonColor: '#A0522D',
        });
        await this.fetchAllUsers(); // Fetch lại danh sách sau khi cập nhật
      } catch (err) {
        console.error(`Error updating user role ${userId}:`, err); // Giữ console.error cho debug
        this.error = err.response?.data?.message || 'Failed to update user role. Server error.';
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: this.error,
          confirmButtonColor: '#A0522D',
        });
        // Nếu lỗi, fetch lại để khôi phục trạng thái cũ trên UI
        await this.fetchAllUsers(); 
      } finally {
        this.isLoading = false;
      }
    },

    // Xác nhận xóa người dùng bằng SweetAlert2
    async confirmDelete(userId) {
      // Ngăn admin tự xóa tài khoản của mình
      if (userId === this.currentAdminId) {
        Swal.fire({
          icon: 'warning',
          title: 'Action Not Allowed',
          text: 'You cannot delete your own account!',
          confirmButtonColor: '#A0522D',
        });
        return;
      }

      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to delete this user. This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545', // Red for delete
        cancelButtonColor: '#6c757d', // Grey for cancel
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
      });

      if (result.isConfirmed) {
        this.deleteUser(userId);
      }
    },

    // Xóa người dùng
    async deleteUser(userId) {
      this.isLoading = true; 
      this.error = null;
      try {
        await apiClient.delete(`/admin/users/${userId}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'User has been deleted successfully.',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          confirmButtonColor: '#A0522D',
        });
        await this.fetchAllUsers(); // Fetch lại danh sách sau khi xóa
      } catch (err) {
        console.error(`Error deleting user ${userId}:`, err); // Giữ console.error cho debug
        this.error = err.response?.data?.message || 'Failed to delete user. Server error.';
        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed',
          text: this.error,
          confirmButtonColor: '#A0522D',
        });
      } finally {
        this.isLoading = false;
      }
    },

    // Hàm định dạng ngày tháng
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
  },
};
</script>

<style scoped>
/* CSS for Admin User List Page */
.admin-user-list-page {
  background-color: var(--bg-light);
  padding: 40px 20px;
  min-height: calc(100vh - 150px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.container {
  max-width: 1200px;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.admin-user-list-page h1 {
  text-align: center;
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.loading-spinner, .error-message, .no-users-message {
  text-align: center;
  font-size: 1.2em;
  color: var(--light-text-color);
  width: 100%;
  padding: 50px 0;
}

.error-message {
  color: #cc0000;
  background-color: #ffe6e6;
  border: 1px solid #cc0000;
  border-radius: 8px;
  padding: 20px;
}

.no-users-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.users-table th, .users-table td {
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  text-align: left;
  vertical-align: middle;
}

.users-table th {
  background-color: var(--primary-color);
  color: #fff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9em;
}

.users-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.users-table tbody tr:hover {
  background-color: #f1f1f1;
}

.role-select {
  padding: 8px 12px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  width: 100px;
  text-transform: capitalize;
  appearance: none; /* Remove default arrow */
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236c757d%22%20d%3D%22M287%2C197.3L159.2%2C69.5c-3.2-3.2-8.3-3.2-11.5%2C0L5.4%2C197.3c-3.2%2C3.2-3.2%2C8.3%2C0%2C11.5l11.5%2C11.5c3.2%2C3.2%2C8.3%2C3.2%2C11.5%2C0l118.8-118.8l118.8%2C118.8c3.2%2C3.2%2C8.3%2C3.2%2C11.5%2C0l11.5-11.5C290.2%2C205.6%2C290.2%2C200.5%2C287%2C197.3z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 10px auto;
}

.role-select.admin {
  background-color: #fff3cd; /* Light yellow */
  color: #856404; /* Dark yellow */
  border-color: #ffc107;
}

.role-select.user {
  background-color: #e2f0fb; /* Light blue */
  color: #004085; /* Dark blue */
  border-color: #007bff;
}

.role-select:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
  opacity: 0.8;
}

.actions-cell {
  text-align: center;
  white-space: nowrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  font-size: 0.9em;
  border: none;
  cursor: pointer;
  margin: 5px;
}

.btn-action i {
  margin-right: 5px;
}

.btn-delete {
  background-color: #dc3545;
  color: #fff;
}

.btn-delete:hover:not(:disabled) {
  background-color: darken(#dc3545, 10%);
}

.btn-delete:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-back-dashboard {
  display: inline-block;
  background-color: #6c757d;
  color: #fff;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  margin-top: 20px;
}

.btn-back-dashboard:hover {
  background-color: darken(#6c757d, 10%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .users-table th, .users-table td {
    padding: 8px 10px;
    font-size: 0.9em;
  }

  .admin-user-list-page h1 {
    font-size: 2.5em;
  }

  .role-select {
    width: 80px;
    font-size: 0.85em;
  }

  .btn-action {
    padding: 6px 10px;
    font-size: 0.8em;
  }
}

@media (max-width: 480px) {
  .users-table th, .users-table td {
    font-size: 0.8em;
  }
  .btn-action {
    padding: 5px 8px;
    font-size: 0.75em;
  }
}
</style>
