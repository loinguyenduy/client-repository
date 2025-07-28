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
    console.log("AdminOrderListPage: Component created."); // Debug log
    // Kiểm tra quyền admin trước khi fetch đơn hàng
    if (!this.isAdmin) {
      console.warn("AdminOrderListPage: User is not admin. Redirecting."); // Debug log
      alert("You are not authorized to view this page. Admin access required.");
      this.$router.push("/"); // Chuyển hướng về trang chủ nếu không phải admin
      return;
    }
    console.log("AdminOrderListPage: User is admin. Fetching all orders..."); // Debug log
    await this.fetchAllOrders();
    console.log("AdminOrderListPage: Orders fetched:", this.orders); // Debug log
    console.log("AdminOrderListPage: isLoading after fetch:", this.isLoading); // Debug log
    console.log("AdminOrderListPage: error after fetch:", this.error); // Debug log
  },
  methods: {
    // Lấy tất cả đơn hàng từ backend (chỉ admin)
    async fetchAllOrders() {
      this.isLoading = true;
      this.error = null;
      try {
        console.log("AdminOrderListPage: Calling API /admin/orders"); // Debug log
        const response = await apiClient.get("/admin/orders");
        this.orders = response.data;
        console.log("AdminOrderListPage: API response data:", response.data); // Debug log
      } catch (err) {
        console.error(
          "AdminOrderListPage: Error fetching all orders (admin):",
          err
        ); // Debug log
        this.error =
          err.response?.data?.message || "Failed to load orders. Server error.";
        this.orders = [];
      } finally {
        this.isLoading = false;
      }
    },

    // Cập nhật trạng thái đơn hàng
    async updateStatus(orderId, newStatus) {
      console.log(
        `AdminOrderListPage: Updating status for order ${orderId} to ${newStatus}`
      ); // Debug log
      // Đặt trạng thái loading cho đơn hàng cụ thể
      this.statusUpdateLoading[orderId] = true; // <-- ĐÃ SỬA: Thay thế this.$set
      console.log(
        "AdminOrderListPage: statusUpdateLoading:",
        this.statusUpdateLoading
      ); // Debug log

      try {
        await apiClient.put(`/admin/orders/${orderId}/status`, {
          status: newStatus,
        });
        alert(`Order ${orderId} status updated to ${newStatus}.`);
        // Để đơn giản, chúng ta sẽ fetch lại toàn bộ danh sách để đảm bảo đồng bộ
        await this.fetchAllOrders();
      } catch (err) {
        console.error(
          `AdminOrderListPage: Error updating status for order ${orderId}:`,
          err
        ); // Debug log
        alert(
          `Failed to update status for order ${orderId}: ${
            err.response?.data?.message || "Server error."
          }`
        );
        // Nếu cập nhật thất bại, fetch lại để khôi phục trạng thái cũ trên UI
        await this.fetchAllOrders();
      } finally {
        // Xóa trạng thái loading cho đơn hàng cụ thể
        delete this.statusUpdateLoading[orderId]; // <-- ĐÃ SỬA: Thay thế this.$delete
        console.log(
          "AdminOrderListPage: statusUpdateLoading after finally:",
          this.statusUpdateLoading
        ); // Debug log
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
  },
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
