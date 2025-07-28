<!-- frontend/src/views/AdminOrderListPage.vue -->
<template>
  <div class="admin-order-list-page">
    <div class="container">
      <h1>Admin Order Management</h1>

      <!-- Hiển thị thông báo loading hoặc lỗi -->
      <div v-if="isLoading" class="loading-spinner">Loading orders...</div>
      <div v-else-if="error" class="error-message">
        {{ error }}
        <router-link to="/" class="btn-back-home">Back to Home</router-link>
      </div>
      <div v-else-if="orders.length === 0" class="no-orders-message">
        No orders found in the system.
      </div>

      <div v-else class="orders-table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Order Date</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order._id">
              <td>{{ order._id }}</td>
              <td>{{ order.user?.fullName || "N/A" }}</td>
              <td>{{ order.user?.email || "N/A" }}</td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>${{ order.totalPrice.toFixed(2) }}</td>
              <td>
                <select
                  v-model="order.status"
                  @change="updateStatus(order._id, order.status)"
                  :class="['status-select', order.status]"
                  :disabled="statusUpdateLoading[order._id]"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td class="actions-cell">
                <router-link
                  :to="{ name: 'adminOrderDetails', params: { id: order._id } }"
                  class="btn-view-details"
                >
                  View Details
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from "@/helpers/api";
import { mapGetters } from "vuex";
import Swal from 'sweetalert2'; // Import SweetAlert2

export default {
  name: "AdminOrderListPage",
  data() {
    return {
      orders: [],
      isLoading: true,
      error: null,
      statusUpdateLoading: {}, // Theo dõi trạng thái loading cho từng lần cập nhật status
    };
  },
  computed: {
    ...mapGetters("user", ["isAdmin"]), // Lấy trạng thái admin từ user module
  },
  async created() {
    // Kiểm tra quyền admin trước khi fetch đơn hàng
    if (!this.isAdmin) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized Access',
        text: 'You are not authorized to view this page. Admin access required.',
        confirmButtonColor: '#A0522D',
      }).then(() => {
        this.$router.push("/"); // Chuyển hướng về trang chủ nếu không phải admin
      });
      return;
    }
    await this.fetchAllOrders();
  },
  methods: {
    // Lấy tất cả đơn hàng từ backend (chỉ admin)
    async fetchAllOrders() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get("/admin/orders");
        this.orders = response.data;
      } catch (err) {
        this.error =
          err.response?.data?.message || "Failed to load orders. Server error.";
        this.orders = [];
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Orders',
          text: this.error,
          confirmButtonColor: '#A0522D',
        });
      } finally {
        this.isLoading = false;
      }
    },

    // Cập nhật trạng thái đơn hàng
    async updateStatus(orderId, newStatus) {
      // Đặt trạng thái loading cho đơn hàng cụ thể
      this.statusUpdateLoading = { ...this.statusUpdateLoading, [orderId]: true }; // Vue 3 reactivity for adding/updating properties

      try {
        await apiClient.put(`/admin/orders/${orderId}/status`, {
          status: newStatus,
        });
        
        Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          text: `Order #${orderId} status updated successfully!.`, // Sử dụng formatStatus nếu bạn muốn hiển thị tên trạng thái đẹp hơn
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          confirmButtonColor: '#A0522D',
        });

        // Để đảm bảo dữ liệu đồng bộ, fetch lại toàn bộ danh sách
        await this.fetchAllOrders(); 
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Server error.";
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: `Failed to update status for order #${orderId}: ${errorMessage}`,
          confirmButtonColor: '#A0522D',
        });
        // Nếu cập nhật thất bại, fetch lại để khôi phục trạng thái cũ trên UI
        await this.fetchAllOrders();
      } finally {
        // Xóa trạng thái loading cho đơn hàng cụ thể
        const newStatusUpdateLoading = { ...this.statusUpdateLoading };
        delete newStatusUpdateLoading[orderId];
        this.statusUpdateLoading = newStatusUpdateLoading;
      }
    },

    // Hàm định dạng ngày tháng
    formatDate(dateString) {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    // Hàm định dạng trạng thái (tái sử dụng từ AdminOrderDetailsPage)
    formatStatus(status) {
      switch (status) {
        case 'pending': return 'Pending';
        case 'processing': return 'Processing';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        default: return status;
      }
    }
  },
  watch: {
    // Theo dõi thay đổi trạng thái admin để fetch đơn hàng lại hoặc chuyển hướng
    isAdmin(newVal) {
      if (newVal) {
        this.fetchAllOrders();
      } else {
        // Nếu không còn là admin, xóa dữ liệu và chuyển hướng
        this.orders = [];
        Swal.fire({
          icon: 'error',
          title: 'Access Revoked',
          text: 'Your admin access has been revoked. Redirecting to home page.',
          confirmButtonColor: '#A0522D',
        }).then(() => {
          this.$router.push('/');
        });
      }
    }
  }
};
</script>

<style scoped>
/* CSS cho trang quản lý đơn hàng của Admin */
.admin-order-list-page {
  background-color: var(--bg-light);
  padding: 40px 20px;
  min-height: calc(100vh - 150px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.container {
  max-width: 1200px; /* Tăng chiều rộng tối đa cho bảng */
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.admin-order-list-page h1 {
  text-align: center;
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.loading-spinner,
.error-message,
.no-orders-message {
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

.orders-table-container {
  overflow-x: auto; /* Cho phép cuộn ngang nếu bảng quá rộng */
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.orders-table th,
.orders-table td {
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  text-align: left;
  vertical-align: middle;
}

.orders-table th {
  background-color: var(--primary-color);
  color: #fff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9em;
}

.orders-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.orders-table tbody tr:hover {
  background-color: #f1f1f1;
}

.status-select {
  padding: 8px 12px;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  width: 120px; /* Đảm bảo chiều rộng đủ cho dropdown */
  appearance: none; /* Remove default arrow */
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236c757d%22%20d%3D%22M287%2C197.3L159.2%2C69.5c-3.2-3.2-8.3-3.2-11.5%2C0L5.4%2C197.3c-3.2%2C3.2-3.2%2C8.3%2C0%2C11.5l11.5%2C11.5c3.2%2C3.2%2C8.3%2C3.2%2C11.5%2C0l118.8-118.8l118.8%2C118.8c3.2%2C3.2%2C8.3%2C3.2%2C11.5%2C0l11.5-11.5C290.2%2C205.6%2C290.2%2C200.5%2C287%2C197.3z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 10px auto;
}

/* Màu sắc cho dropdown trạng thái */
.status-select.pending {
  background-color: #ffedcc;
  color: #ffa500;
  border-color: #ffa500;
}

.status-select.processing {
  background-color: #d1ecf1;
  color: #17a2b8;
  border-color: #17a2b8;
}

.status-select.completed {
  background-color: #d4edda;
  color: #28a745;
  border-color: #28a745;
}

.status-select.cancelled {
  background-color: #f8d7da;
  color: #dc3545;
  border-color: #dc3545;
}

.actions-cell {
  text-align: center;
  white-space: nowrap; /* Ngăn nút xuống dòng */
}

.btn-view-details {
  display: inline-block;
  background-color: #007bff; /* Blue */
  color: #fff;
  padding: 8px 15px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn-view-details:hover {
  background-color: darken(#007bff, 10%);
}

.btn-back-home {
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

.btn-back-home:hover {
  background-color: darken(#6c757d, 10%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .orders-table th,
  .orders-table td {
    padding: 8px 10px;
    font-size: 0.9em;
  }

  .admin-order-list-page h1 {
    font-size: 2.5em;
  }

  .status-select {
    width: 100px;
    font-size: 0.85em;
  }

  .btn-view-details {
    padding: 6px 10px;
    font-size: 0.85em;
  }
}

@media (max-width: 480px) {
  .orders-table th,
  .orders-table td {
    font-size: 0.8em;
  }
  .status-select {
    width: 80px;
    font-size: 0.8em;
  }
  .btn-view-details {
    padding: 5px 8px;
    font-size: 0.8em;
  }
}
</style>
