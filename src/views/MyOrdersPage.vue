<template>
  <div class="my-orders-page">
    <div class="container">
      <h1>My Orders</h1>

      <div v-if="isLoading" class="loading-spinner">Loading your orders...</div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <router-link to="/menu" class="btn-back-to-menu"
          >Back to Menu</router-link
        >
      </div>

      <div v-else-if="orders.length === 0" class="empty-orders-message">
        <p>You haven't placed any orders yet.</p>
        <router-link to="/menu" class="btn-primary"
          >Start Ordering Now!</router-link
        >
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order._id" class="order-card">
          <div class="order-header">
            <h3>Order ID: {{ order._id }}</h3>
            <span :class="['order-status', order.status]">{{
              formatStatus(order.status)
            }}</span>
          </div>
          <div class="order-details">
            <p>
              <strong>Order Date:</strong> {{ formatDate(order.createdAt) }}
            </p>
            <p>
              <strong>Total Amount:</strong> ${{ order.totalPrice.toFixed(2) }}
            </p>
            <p><strong>Payment Method:</strong> {{ order.paymentMethod }}</p>
            <p>
              <strong>Delivery Type:</strong>
              {{ order.deliveryType === "shipping" ? "Delivery" : "Pickup" }}
            </p>
            <p v-if="order.deliveryType === 'shipping'">
              <strong>Shipping Address:</strong> {{ order.shippingAddress }}
            </p>
          </div>
          <div class="order-actions">
            <router-link :to="`/orders/${order._id}`" class="btn-details"
              >View Details</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from "@/helpers/api";
import { mapGetters } from "vuex";

export default {
  name: "MyOrdersPage",
  data() {
    return {
      orders: [],
      isLoading: true,
      error: null,
    };
  },
  computed: {
    ...mapGetters("user", ["isLoggedIn"]),
  },
  async created() {
    if (!this.isLoggedIn) {
      alert("You need to login.");
      this.$router.push("/login");
      return;
    }
    await this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get("/orders/myorders");
        this.orders = response.data;
      } catch (err) {
        console.error("Error fetching orders:", err);
        this.error =
          err.response?.data?.message || "Failed to load your orders.";
        this.orders = [];
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
    isLoggedIn(newVal) {
      if (newVal) {
        this.fetchOrders();
      } else {
        this.orders = []; 
      }
    },
  },
};
</script>

<style scoped>
.my-orders-page {
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

.my-orders-page h1 {
  text-align: center;
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.loading-spinner,
.error-message,
.empty-orders-message {
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

.empty-orders-message .btn-primary {
  margin-top: 20px;
  display: inline-block;
  background-color: var(--primary-color);
  color: #fff;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.empty-orders-message .btn-primary:hover {
  background-color: darken(var(--primary-color), 10%);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.order-card {
  background-color: #f9f9f9;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.order-card:hover {
  transform: translateY(-3px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.order-header h3 {
  font-size: 1.5em;
  color: var(--primary-color);
  margin: 0;
  font-family: var(--font-family-heading);
}

.order-status {
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 0.9em;
  text-transform: capitalize;
}

.order-status.pending {
  background-color: #ffedcc;
  color: #ffa500; 
}

.order-status.processing {
  background-color: #d1ecf1;
  color: #17a2b8; 
}

.order-status.completed {
  background-color: #d4edda;
  color: #28a745; 
}

.order-status.cancelled {
  background-color: #f8d7da;
  color: #dc3545;
}

.order-details p {
  font-size: 1.1em;
  color: var(--text-color);
  margin-bottom: 8px;
}

.order-details p strong {
  color: var(--primary-color);
}

.order-actions {
  margin-top: 20px;
  text-align: right;
}

.btn-details {
  display: inline-block;
  background-color: #6c757d;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn-details:hover {
  background-color: darken(#6c757d, 10%);
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
  }
  .my-orders-page h1 {
    font-size: 2.5em;
  }
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .order-actions {
    text-align: center;
  }
  .btn-details {
    width: 100%;
  }
}
</style>
