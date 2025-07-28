<!-- frontend/src/views/CartPage.vue -->
<template>
  <div class="cart-page">
    <div class="container">
      <h1>Your Shopping Cart</h1>

      <!-- Hiển thị Loading Spinner -->
      <div v-if="isCartLoading" class="loading-spinner">Loading your cart...</div>

      <!-- Hiển thị thông báo lỗi nếu có -->
      <div v-else-if="getCartError" class="error-message">
        {{ getCartError }}
        <router-link to="/menu" class="btn-back-to-menu">Back to Menu</router-link>
      </div>

      <!-- Hiển thị giỏ hàng rỗng -->
      <div v-else-if="getCartItems.length === 0" class="empty-cart-message">
        <p>Your cart is empty. Start adding some delicious food!</p>
        <router-link to="/menu" class="btn-primary">Explore Menu</router-link>
      </div>

      <!-- Hiển thị nội dung giỏ hàng -->
      <div v-else class="cart-content">
        <div class="cart-items-list">
          <!-- ĐÃ SỬA: Sử dụng item._id làm key và thêm kiểm tra item.product -->
          <div v-for="item in getCartItems" :key="item._id" class="cart-item-card">
            <template v-if="item.product">
              <img :src="getBackendImageUrl(item.image)" :alt="item.name" class="cart-item-image" />
              <div class="cart-item-details">
                <h3 class="cart-item-name">{{ item.name }}</h3>
                <p class="cart-item-price">${{ item.price.toFixed(2) }}</p>
                <div class="quantity-controls">
                  <button @click="updateQuantity(item.product._id, item.quantity - 1)" :disabled="item.quantity <= 1" class="quantity-button">-</button>
                  <input type="number" v-model.number="item.quantity" @change="handleQuantityChange(item.product._id, item.quantity)" min="1" class="quantity-input" />
                  <button @click="updateQuantity(item.product._id, item.quantity + 1)" class="quantity-button">+</button>
                </div>
                <p class="item-total">Total: ${{ (item.price * item.quantity).toFixed(2) }}</p>
              </div>
              <button @click="handleRemoveFromCart(item.product._id)" class="remove-item-button">
                <i class="fas fa-times-circle"></i>
              </button>
            </template>
            <template v-else>
              <!-- Hiển thị thông báo nếu sản phẩm không tồn tại -->
              <div class="invalid-cart-item">
                <p>This item's product is no longer available or has been deleted.</p>
                <!-- Nút xóa mục này khỏi giỏ hàng. Sử dụng item.product._id nếu có, nếu không thì dùng item._id -->
                <button @click="handleRemoveFromCart(item.product ? item.product._id : item._id)" class="remove-item-button remove-invalid">
                  <i class="fas fa-trash-alt"></i> Remove Invalid Item
                </button>
              </div>
            </template>
          </div>
        </div>

        <div class="cart-summary">
          <h2>Order Summary</h2>
          <div class="summary-details">
            <p>Subtotal: <span>${{ getCartTotal.toFixed(2) }}</span></p>
            <p>Shipping: <span>$0.00</span></p>
            <hr>
            <p class="grand-total">Grand Total: <span>${{ getCartTotal.toFixed(2) }}</span></p>
          </div>
          <div class="cart-actions">
            <button @click="handleClearCart" class="btn-clear-cart">Clear Cart</button>
            <button @click="handleCheckout" class="btn-checkout">Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/helpers/api';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'CartPage',
  computed: {
    // Ánh xạ các getters từ user và cart modules
    ...mapGetters('user', ['isLoggedIn']),
    ...mapGetters('cart', ['getCartItems', 'getCartTotal', 'isCartLoading', 'getCartError']),
  },
  async created() {
    // Kiểm tra đăng nhập trước khi fetch giỏ hàng
    if (!this.isLoggedIn) {
      alert('Bạn cần đăng nhập để xem giỏ hàng của mình.');
      this.$router.push('/login');
      return;
    }
    await this.fetchCart(); // Fetch giỏ hàng khi component được tạo
  },
  methods: {
    // Ánh xạ các actions từ cart module
    ...mapActions('cart', ['fetchCart', 'updateCartQuantity', 'removeFromCart', 'clearCart']),

    // Hàm để lấy URL hình ảnh đầy đủ từ backend (tái sử dụng)
    getBackendImageUrl(imagePath) {
      const backendBaseUrl = apiClient.defaults.baseURL.replace('/api', '');
      if (!imagePath || imagePath === '/uploads/placeholder.jpg') {
        return 'https://via.placeholder.com/100x100/f0f0f0/cccccc?text=No+Image'; 
      }
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      return `${backendBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    },

    // Xử lý cập nhật số lượng
    async updateQuantity(productId, newQuantity) {
      if (newQuantity < 1) newQuantity = 1; // Đảm bảo số lượng không nhỏ hơn 1
      
      // Gọi action Vuex để cập nhật số lượng
      try {
        await this.updateCartQuantity({ productId, quantity: newQuantity });
      } catch (err) {
        console.error('Error updating quantity:', err);
        alert(err.message || 'Failed to update quantity.'); // Hiển thị lỗi
      }
    },

    // Xử lý thay đổi số lượng từ input (khi người dùng tự gõ)
    handleQuantityChange(productId, newQuantity) {
      // Đảm bảo giá trị là số nguyên dương
      newQuantity = parseInt(newQuantity);
      if (isNaN(newQuantity) || newQuantity < 1) {
        newQuantity = 1;
      }
      this.updateQuantity(productId, newQuantity);
    },

    // Xử lý xóa sản phẩm khỏi giỏ hàng
    async handleRemoveFromCart(productId) {
      if (confirm('Are you sure you want to remove this item from your cart?')) {
        try {
          await this.removeFromCart(productId);
        } catch (err) {
          console.error('Error removing item:', err);
          alert(err.message || 'Failed to remove item from cart.');
        }
      }
    },

    // Xử lý xóa toàn bộ giỏ hàng
    async handleClearCart() {
      if (confirm('Are you sure you want to clear your entire cart?')) {
        try {
          await this.clearCart();
        } catch (err) {
          console.error('Error clearing cart:', err);
          alert(err.message || 'Failed to clear cart.');
        }
      }
    },

    // Xử lý tiến hành thanh toán
    handleCheckout() {
      this.$router.push('/checkout');
    },
  },
  watch: {
    // Theo dõi thay đổi trạng thái đăng nhập để fetch giỏ hàng lại
    isLoggedIn(newVal) {
      if (newVal) {
        this.fetchCart();
      }
      // Không cần else ở đây vì Vuex action logout đã tự clear cart.
      // Tránh gán trực tiếp getter: this.getCartItems = [];
    }
  }
};
</script>

<style scoped>
/* CSS cho trang giỏ hàng */
.cart-page {
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

.cart-page h1 {
  text-align: center;
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.loading-spinner, .error-message, .empty-cart-message {
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

.empty-cart-message .btn-primary {
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

.empty-cart-message .btn-primary:hover {
  background-color: darken(var(--primary-color), 10%);
}

.cart-content {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
}

.cart-items-list {
  flex: 2; /* Chiếm nhiều không gian hơn */
  min-width: 400px; /* Đảm bảo không quá nhỏ */
}

.cart-item-card {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
}

.cart-item-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
}

.cart-item-details {
  flex-grow: 1;
  text-align: left;
}

.cart-item-name {
  font-size: 1.4em;
  color: var(--text-color);
  margin-bottom: 5px;
  font-family: var(--font-family-heading);
}

.cart-item-price {
  font-size: 1.1em;
  color: var(--primary-color);
  font-weight: bold;
  margin-bottom: 10px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.quantity-button {
  background-color: #e0e0e0;
  border: none;
  padding: 8px 12px;
  font-size: 1em;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.quantity-button:hover:not(:disabled) {
  background-color: #d0d0d0;
}

.quantity-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.quantity-input {
  width: 50px;
  padding: 8px 0;
  text-align: center;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  margin: 0 5px;
  font-size: 1em;
  -moz-appearance: textfield;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.item-total {
  font-size: 1.2em;
  font-weight: bold;
  color: var(--accent-color);
}

.remove-item-button {
  background: none;
  border: none;
  color: #dc3545; /* Đỏ */
  font-size: 1.5em;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
  transition: color 0.3s ease;
}

.remove-item-button:hover {
  color: darken(#dc3545, 10%);
}

/* New style for invalid cart item */
.invalid-cart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 15px;
  background-color: #fff3cd; /* Light yellow background */
  border: 1px solid #ffc107; /* Orange border */
  border-radius: 8px;
  color: #856404; /* Dark yellow text */
  text-align: center;
}

.invalid-cart-item p {
  margin-bottom: 10px;
  font-weight: 500;
}

.invalid-cart-item .remove-invalid {
  position: static; /* Override absolute positioning */
  margin-top: 10px;
  background-color: #dc3545; /* Red button */
  color: #fff;
  padding: 8px 15px;
  border-radius: 8px;
  font-size: 0.9em;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.invalid-cart-item .remove-invalid:hover {
  background-color: darken(#dc3545, 10%);
}


.cart-summary {
  flex: 1; /* Chiếm không gian còn lại */
  min-width: 300px;
  background-color: #f9f9f9;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  height: fit-content; /* Đảm bảo chiều cao vừa với nội dung */
}

.cart-summary h2 {
  font-size: 1.8em;
  color: var(--primary-color);
  margin-bottom: 20px;
  font-family: var(--font-family-heading);
  text-align: center;
}

.summary-details p {
  display: flex;
  justify-content: space-between;
  font-size: 1.1em;
  margin-bottom: 10px;
  color: var(--text-color);
}

.summary-details p span {
  font-weight: bold;
  color: var(--primary-color);
}

.summary-details hr {
  border: 0;
  border-top: 1px dashed var(--border-color);
  margin: 15px 0;
}

.grand-total {
  font-size: 1.5em !important;
  font-weight: bold;
  color: var(--accent-color) !important;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
}

.btn-clear-cart {
  background-color: #ffc107; /* Màu vàng */
  color: #333;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-clear-cart:hover {
  background-color: darken(#ffc107, 10%);
}

.btn-checkout {
  background-color: var(--primary-color);
  color: #fff;
  padding: 15px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-checkout:hover {
  background-color: darken(var(--primary-color), 10%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cart-items-list, .cart-summary {
    min-width: unset;
    width: 100%;
  }
  .cart-item-card {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  .cart-item-image {
    margin-right: 0;
    margin-bottom: 15px;
  }
  .remove-item-button {
    position: static;
    margin-top: 10px;
  }
  .quantity-controls {
    justify-content: center;
  }
}
</style>
