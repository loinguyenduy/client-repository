<!-- frontend/src/views/OrderDetailsPage.vue -->
<template>
  <div class="order-details-page">
    <div class="container">
      <h1>Order Details</h1>

      <!-- Hiển thị Loading Spinner -->
      <div v-if="isLoading" class="loading-spinner">
        Loading order details...
      </div>

      <!-- Hiển thị thông báo lỗi nếu có -->
      <div v-else-if="error" class="error-message">
        {{ error }}
        <router-link to="/orders/myorders" class="btn-back-to-orders"
          >Back to My Orders</router-link
        >
      </div>

      <!-- Hiển thị chi tiết đơn hàng -->
      <div v-else-if="order" class="order-detail-card">
        <div class="order-summary-header">
          <h2>Order #{{ order._id }}</h2>
          <span :class="['order-status', order.status]">{{
            formatStatus(order.status)
          }}</span>
        </div>

        <div class="order-sections">
          <!-- Order Information -->
          <div class="order-info-section">
            <h3>Order Information</h3>
            <p>
              <strong>Order Date:</strong> {{ formatDate(order.createdAt) }}
            </p>
            <p><strong>Payment Method:</strong> {{ order.paymentMethod }}</p>
            <p>
              <strong>Delivery Type:</strong>
              {{ order.deliveryType === "shipping" ? "Delivery" : "Pickup" }}
            </p>
            <p v-if="order.note"><strong>Note:</strong> {{ order.note }}</p>
          </div>

          <!-- Shipping Information -->
          <div
            v-if="order.deliveryType === 'shipping'"
            class="shipping-info-section"
          >
            <h3>Shipping Address</h3>
            <p><strong>Address:</strong> {{ order.shippingAddress }}</p>
            <!-- Giả định bạn có thể lấy số điện thoại từ user hoặc order -->
            <!-- <p><strong>Phone:</strong> {{ order.user.phoneNumber || 'N/A' }}</p> -->
          </div>

          <!-- Customer Information -->
          <div class="customer-info-section">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> {{ order.user.fullName }}</p>
            <p><strong>Email:</strong> {{ order.user.email }}</p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="order-items-section">
          <h3>Items in Order</h3>
          <div class="order-items-table">
            <div class="table-header">
              <div class="col-item">Item</div>
              <div class="col-qty">Qty</div>
              <div class="col-price">Price</div>
              <div class="col-total">Total</div>
            </div>
            <div
              v-for="item in order.orderItem"
              :key="item.product._id"
              class="table-row"
            >
              <div class="col-item">
                <img
                  :src="getBackendImageUrl(item.image)"
                  :alt="item.name"
                  class="item-image"
                />
                <span>{{ item.name }}</span>
              </div>
              <div class="col-qty">{{ item.quantity }}</div>
              <div class="col-price">${{ item.price.toFixed(2) }}</div>
              <div class="col-total">
                ${{ (item.quantity * item.price).toFixed(2) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Order Totals -->
        <div class="order-totals-section">
          <p>
            Subtotal: <span>${{ order.itemPrice.toFixed(2) }}</span>
          </p>
          <p>
            Shipping: <span>${{ order.shippingPrice.toFixed(2) }}</span>
          </p>
          <p>
            Tax (10%): <span>${{ order.taxPrice.toFixed(2) }}</span>
          </p>
          <hr />
          <p class="grand-total">
            Grand Total: <span>${{ order.totalPrice.toFixed(2) }}</span>
          </p>
        </div>

        <div class="order-actions-bottom">
          <router-link to="/orders/myorders" class="btn-back-to-orders"
            >Back to My Orders</router-link
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from "@/helpers/api";
import { mapGetters } from "vuex";

export default {
  name: "OrderDetailsPage",
  props: ["id"], // Nhận order ID từ URL route
  data() {
    return {
      order: null,
      isLoading: true,
      error: null,
    };
  },
  computed: {
    ...mapGetters("user", ["isLoggedIn"]),
  },
  async created() {
    console.log(
      "OrderDetailsPage: Component created, Order ID from props:",
      this.id
    ); // Debug log
    // Kiểm tra đăng nhập trước khi fetch đơn hàng
    if (!this.isLoggedIn) {
      alert("Bạn cần đăng nhập để xem chi tiết đơn hàng.");
      this.$router.push("/login");
      return;
    }
    await this.fetchOrderDetails();
    console.log("OrderDetailsPage: Order data after fetch:", this.order); // Debug log
    console.log("OrderDetailsPage: isLoading after fetch:", this.isLoading); // Debug log
    console.log("OrderDetailsPage: error after fetch:", this.error); // Debug log
  },
  methods: {
    // Hàm để lấy URL hình ảnh đầy đủ từ backend (tái sử dụng)
    getBackendImageUrl(imagePath) {
      const backendBaseUrl = apiClient.defaults.baseURL.replace("/api", "");
      if (!imagePath || imagePath === "/uploads/placeholder.jpg") {
        return "https://via.placeholder.com/50x50/f0f0f0/cccccc?text=No+Image";
      }
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
      }
      return `${backendBaseUrl}${
        imagePath.startsWith("/") ? "" : "/"
      }${imagePath}`;
    },

    // Lấy chi tiết đơn hàng từ backend
    async fetchOrderDetails() {
      this.isLoading = true;
      this.error = null;
      try {
        console.log(
          `OrderDetailsPage: Fetching order with ID: /orders/${this.id}`
        ); // Debug log
        const response = await apiClient.get(`/orders/${this.id}`);
        this.order = response.data;
        console.log("OrderDetailsPage: API response data:", response.data); // Debug log
      } catch (err) {
        console.error("OrderDetailsPage: Error fetching order details:", err); // Debug log
        this.error =
          err.response?.data?.message ||
          "Failed to load order details. Order not found or server error.";
        this.order = null; // Đảm bảo đơn hàng là null nếu có lỗi
      } finally {
        this.isLoading = false;
      }
    },
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
    formatStatus(status) {
      switch (status) {
        case "pending":
          return "Pending";
        case "processing":
          return "Processing";
        case "completed":
          return "Completed";
        case "cancelled":
          return "Cancelled";
        default:
          return status;
      }
    },
  },
  watch: {
    // Theo dõi thay đổi của ID đơn hàng trong URL (nếu người dùng chuyển giữa các trang chi tiết đơn hàng)
    id: "fetchOrderDetails",
    // Theo dõi thay đổi trạng thái đăng nhập để fetch đơn hàng lại
    isLoggedIn(newVal) {
      if (newVal) {
        console.log(
          "OrderDetailsPage: isLoggedIn changed to true, refetching order details..."
        ); // Debug log
        this.fetchOrderDetails();
      } else {
        console.log(
          "OrderDetailsPage: isLoggedIn changed to false, clearing order details..."
        ); // Debug log
        this.order = null; // Xóa chi tiết đơn hàng nếu người dùng đăng xuất
      }
    },
  },
};
</script>

<style scoped>
/* CSS cho trang chi tiết đơn hàng */
.order-details-page {
  background-color: var(--bg-light);
  padding: 40px 20px;
  min-height: calc(100vh - 150px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.container {
  max-width: 900px;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.order-details-page h1 {
  text-align: center;
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.loading-spinner,
.error-message {
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

.order-detail-card {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.order-summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.order-summary-header h2 {
  font-size: 2em;
  color: var(--primary-color);
  margin: 0;
  font-family: var(--font-family-heading);
}

.order-status {
  padding: 8px 15px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 1em;
  text-transform: capitalize;
}

.order-status.pending {
  background-color: #ffedcc;
  color: #ffa500; /* Orange */
}

.order-status.processing {
  background-color: #d1ecf1;
  color: #17a2b8; /* Blue */
}

.order-status.completed {
  background-color: #d4edda;
  color: #28a745; /* Green */
}

.order-status.cancelled {
  background-color: #f8d7da;
  color: #dc3545; /* Red */
}

.order-sections {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.order-info-section,
.shipping-info-section,
.customer-info-section {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}

.order-info-section h3,
.shipping-info-section h3,
.customer-info-section h3 {
  font-size: 1.4em;
  color: var(--text-color);
  margin-bottom: 15px;
  font-family: var(--font-family-heading);
  border-bottom: 1px dashed var(--border-color);
  padding-bottom: 10px;
}

.order-info-section p,
.shipping-info-section p,
.customer-info-section p {
  font-size: 1.1em;
  margin-bottom: 8px;
  color: var(--light-text-color);
}

.order-info-section p strong,
.shipping-info-section p strong,
.customer-info-section p strong {
  color: var(--primary-color);
}

.order-items-section {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.order-items-section h3 {
  font-size: 1.8em;
  color: var(--primary-color);
  margin-bottom: 20px;
  font-family: var(--font-family-heading);
  text-align: center;
}

.order-items-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr; /* Item, Qty, Price, Total */
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.table-header {
  font-weight: bold;
  color: var(--text-color);
  font-size: 1.1em;
  background-color: #e9ecef;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 10px;
}

.table-row {
  font-size: 1em;
  color: var(--light-text-color);
}

.table-row:last-child {
  border-bottom: none;
}

.col-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
}

.col-qty,
.col-price,
.col-total {
  text-align: center;
}

.col-total {
  font-weight: bold;
  color: var(--accent-color);
}

/* Order Totals */
.order-totals-section {
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  text-align: right;
}

.order-totals-section p {
  display: flex;
  justify-content: space-between;
  font-size: 1.1em;
  margin-bottom: 10px;
  color: var(--text-color);
}

.order-totals-section p span {
  font-weight: bold;
  color: var(--primary-color);
}

.order-totals-section hr {
  border: 0;
  border-top: 1px dashed var(--border-color);
  margin: 15px 0;
}

.order-totals-section .grand-total {
  font-size: 1.5em !important;
  font-weight: bold;
  color: var(--accent-color) !important;
}

.order-actions-bottom {
  text-align: center;
  margin-top: 20px;
}

.btn-back-to-orders {
  display: inline-block;
  background-color: #6c757d;
  color: #fff;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn-back-to-orders:hover {
  background-color: darken(#6c757d, 10%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding: 20px;
  }
  .order-details-page h1 {
    font-size: 2.5em;
  }
  .order-summary-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .order-sections {
    grid-template-columns: 1fr;
  }
  .order-items-table .table-header,
  .order-items-table .table-row {
    grid-template-columns: 2fr 1fr 1fr 1fr; /* Điều chỉnh cột cho màn hình nhỏ */
    font-size: 0.9em;
  }
  .col-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .item-image {
    width: 40px;
    height: 40px;
    margin-right: 0;
    margin-bottom: 5px;
  }
}

@media (max-width: 576px) {
  .order-items-table .table-header,
  .order-items-table .table-row {
    grid-template-columns: 1.5fr 0.8fr 0.8fr 1fr; /* Điều chỉnh thêm cho màn hình rất nhỏ */
    font-size: 0.8em;
  }
}
</style>
