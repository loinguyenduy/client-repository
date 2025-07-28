<!-- frontend/src/views/CheckoutPage.vue -->
<template>
  <div class="checkout-page">
    <div class="container">
      <h1>Checkout</h1>

      <!-- Hiển thị Loading Spinner -->
      <div v-if="isCartLoading" class="loading-spinner">Loading cart for checkout...</div>

      <!-- Hiển thị thông báo lỗi nếu có -->
      <div v-else-if="getCartError" class="error-message">
        {{ getCartError }}
        <router-link to="/menu" class="btn-back-to-menu">Back to Menu</router-link>
      </div>

      <!-- Hiển thị khi giỏ hàng rỗng -->
      <div v-else-if="validCartItems.length === 0" class="empty-cart-message">
        <p>Your cart is empty or contains no valid items. Please add items before proceeding to checkout.</p>
        <router-link to="/menu" class="btn-primary">Explore Menu</router-link>
      </div>

      <!-- Nội dung trang thanh toán -->
      <div v-else class="checkout-content">
        <div class="shipping-payment-section">
          <h2>Shipping Information</h2>
          <form @submit.prevent="handlePlaceOrder" class="shipping-form">
            <div class="form-group">
              <label for="fullName">Full Name:</label>
              <input type="text" id="fullName" v-model="shippingInfo.fullName" required />
            </div>
            <div class="form-group">
              <label for="phone">Phone Number:</label>
              <input type="tel" id="phone" v-model="shippingInfo.phone" required />
            </div>
            <div class="form-group">
              <label for="deliveryType">Delivery Type:</label>
              <select id="deliveryType" v-model="shippingInfo.deliveryType" class="delivery-select">
                <option value="pickup">Pickup at Restaurant</option>
                <option value="shipping">Delivery to Address</option>
              </select>
            </div>
            
            <!-- TRƯỜNG ĐỊA CHỈ GIAO HÀNG CÓ ĐIỀU KIỆN -->
            <div class="form-group" v-if="shippingInfo.deliveryType === 'shipping'">
              <label for="address">Shipping Address:</label>
              <input 
                type="text" 
                id="address" 
                v-model="shippingInfo.address" 
                :required="shippingInfo.deliveryType === 'shipping'" 
              />
            </div>
            
            <div class="form-group">
              <label for="note">Order Note (optional):</label>
              <textarea id="note" v-model="shippingInfo.note" rows="3"></textarea>
            </div>

            <h2>Payment Method</h2>
            <div class="payment-methods">
              <div class="radio-group">
                <input type="radio" id="cash" value="Cash" v-model="paymentMethod" required />
                <label for="cash">Cash on Delivery (COD)</label>
              </div>
              <!-- <div class="radio-group">
                <input type="radio" id="card" value="Card" v-model="paymentMethod" disabled />
                <label for="card">Credit/Debit Card (Coming Soon)</label>
              </div> -->
            </div>

            <div v-if="orderErrorMessage" class="order-message error">
              {{ orderErrorMessage }}
            </div>
            <div v-if="orderSuccessMessage" class="order-message success">
              {{ orderSuccessMessage }}
            </div>

            <button type="submit" :disabled="isPlacingOrder" class="btn-place-order">
              <span v-if="isPlacingOrder">Placing Order...</span>
              <span v-else>Place Order</span>
            </button>
          </form>
        </div>

        <div class="order-summary-section">
          <h2>Your Order</h2>
          <div class="order-items-summary">
            <!-- ĐÃ SỬA: Sử dụng validCartItems thay vì getCartItems -->
            <div v-for="item in validCartItems" :key="item.product._id" class="summary-item">
              <img :src="getBackendImageUrl(item.image)" :alt="item.name" class="summary-item-image" />
              <div class="summary-item-info">
                <p class="summary-item-name">{{ item.name }}</p>
                <p class="summary-item-qty-price">{{ item.quantity }} x ${{ item.price.toFixed(2) }}</p>
              </div>
              <p class="summary-item-total">${{ (item.quantity * item.price).toFixed(2) }}</p>
            </div>
          </div>
          <div class="summary-totals">
            <p>Subtotal: <span>${{ calculatedSubtotal.toFixed(2) }}</span></p>
            <p>Shipping: <span>${{ calculatedShippingPrice.toFixed(2) }}</span></p>
            <p>Tax (10%): <span>${{ calculatedTaxPrice.toFixed(2) }}</span></p>
            <hr>
            <p class="grand-total">Grand Total: <span>${{ calculatedGrandTotal.toFixed(2) }}</span></p>
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
  name: 'CheckoutPage',
  data() {
    return {
      shippingInfo: {
        fullName: '',
        address: '',
        phone: '',
        deliveryType: 'pickup', // Mặc định là pickup
        note: '',
      },
      paymentMethod: 'Cash', // Mặc định là Cash on Delivery
      isPlacingOrder: false,
      orderSuccessMessage: '',
      orderErrorMessage: '',
    };
  },
  computed: {
    // Ánh xạ các getters từ user và cart modules
    ...mapGetters('user', ['isLoggedIn', 'getUserInfo']),
    ...mapGetters('cart', ['getCartItems', 'isCartLoading', 'getCartError']),

    // NEW: Computed property to filter out invalid cart items
    validCartItems() {
      return this.getCartItems.filter(item => item.product !== null);
    },

    // NEW: Calculate subtotal based on valid items
    calculatedSubtotal() {
      return this.validCartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    },

    // Tính toán phí vận chuyển dựa trên deliveryType
    calculatedShippingPrice() {
      return this.shippingInfo.deliveryType === 'shipping' ? 5.00 : 0.00; // Phí ship cố định 5$
    },
    // Tính toán thuế (10% của tổng giá sản phẩm)
    calculatedTaxPrice() {
      const subtotal = parseFloat(this.calculatedSubtotal || 0); 
      return subtotal * 0.1; 
    },
    // Tính toán tổng cộng (Subtotal + Shipping + Tax)
    calculatedGrandTotal() {
      const subtotal = parseFloat(this.calculatedSubtotal || 0);
      const shipping = this.calculatedShippingPrice;
      const tax = this.calculatedTaxPrice; 
      return subtotal + shipping + tax;
    }
  },
  async created() {
    // Kiểm tra đăng nhập
    if (!this.isLoggedIn) {
      alert('You need to login to proceed to checkout.');
      this.$router.push('/login');
      return;
    }

    // Fetch giỏ hàng để đảm bảo dữ liệu mới nhất
    await this.fetchCart();

    // Kiểm tra giỏ hàng rỗng SAU KHI fetch và lọc
    if (this.validCartItems.length === 0) { 
      alert('Your cart is empty or contains no valid items. Please add items before proceeding to checkout.');
      this.$router.push('/menu'); 
      return;
    }

    // Điền trước thông tin người dùng nếu có
    if (this.getUserInfo) {
      this.shippingInfo.fullName = this.getUserInfo.fullName || ''; 
      this.shippingInfo.address = this.getUserInfo.address || ''; 
      this.shippingInfo.phone = this.getUserInfo.phoneNumber || ''; 
    }
  },
  methods: {
    // Ánh xạ các actions từ cart module
    ...mapActions('cart', ['fetchCart', 'clearCart']),

    // Hàm để lấy URL hình ảnh đầy đủ từ backend (tái sử dụng)
    getBackendImageUrl(imagePath) {
      const backendBaseUrl = apiClient.defaults.baseURL.replace('/api', '');
      if (!imagePath || imagePath === '/uploads/placeholder.jpg') {
        return 'https://via.placeholder.com/50x50/f0f0f0/cccccc?text=No+Image'; 
      }
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      return `${backendBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    },

    // Xử lý đặt hàng
    async handlePlaceOrder() {
      this.isPlacingOrder = true;
      this.orderSuccessMessage = '';
      this.orderErrorMessage = '';

      // Thêm kiểm tra validation cho địa chỉ nếu deliveryType là 'shipping'
      if (this.shippingInfo.deliveryType === 'shipping' && !this.shippingInfo.address) {
        this.orderErrorMessage = 'Shipping address is required for delivery!';
        this.isPlacingOrder = false;
        return;
      }

      // Đảm bảo có ít nhất một sản phẩm hợp lệ trong giỏ hàng để đặt
      if (this.validCartItems.length === 0) {
        this.orderErrorMessage = 'Your cart contains no valid items to order. Please add valid items.';
        this.isPlacingOrder = false;
        return;
      }

      try {
        const orderData = {
          // Sử dụng validCartItems để đảm bảo chỉ gửi các sản phẩm hợp lệ
          orderItem: this.validCartItems.map(item => ({
            product: item.product._id, 
            name: item.name,
            quantity: item.quantity,
            image: item.image,
            price: item.price,
          })),
          itemPrice: parseFloat(this.calculatedSubtotal.toFixed(2)), 
          deliveryType: this.shippingInfo.deliveryType,
          shippingAddress: this.shippingInfo.deliveryType === 'shipping' ? this.shippingInfo.address : undefined,
          paymentMethod: this.paymentMethod,
          taxPrice: parseFloat(this.calculatedTaxPrice.toFixed(2)), 
          shippingPrice: parseFloat(this.calculatedShippingPrice.toFixed(2)),
          totalPrice: parseFloat(this.calculatedGrandTotal.toFixed(2)), 
          note: this.shippingInfo.note,
        };

        const response = await apiClient.post('/orders', orderData);
        
        this.orderSuccessMessage = `Order placed successfully! Order ID: ${response.data._id}`;
        this.orderErrorMessage = '';

        await this.clearCart(); 

        setTimeout(() => {
          this.$router.push(`/orders/myorders`); 
        }, 2000);

      } catch (err) {
        console.error('Error placing order:', err);
        this.orderErrorMessage = err.response?.data?.message || 'Failed to place order. Please try again.';
        this.orderSuccessMessage = '';
      } finally {
        this.isPlacingOrder = false;
      }
    },
  },
};
</script>

<style scoped>
/* CSS cho trang thanh toán */
.checkout-page {
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

.checkout-page h1 {
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

.checkout-content {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
}

.shipping-payment-section {
  flex: 2;
  min-width: 400px;
  padding: 25px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.shipping-payment-section h2 {
  font-size: 1.8em;
  color: var(--primary-color);
  margin-bottom: 25px;
  font-family: var(--font-family-heading);
  text-align: center;
}

.shipping-form .form-group {
  margin-bottom: 20px;
  text-align: left;
}

.shipping-form label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-color);
}

.shipping-form input[type="text"],
.shipping-form input[type="tel"],
.shipping-form textarea,
.shipping-form select {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  box-sizing: border-box; /* Đảm bảo padding không làm tăng width */
}

.shipping-form textarea {
  resize: vertical;
}

.delivery-select {
  appearance: none; /* Loại bỏ style mặc định của select */
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-6.5%200-12.3%203.2-16.1%208.1-3.7%204.9-4.9%2011-3.6%2017.3l133.3%20170.9c5.1%206.5%2012.8%2010.1%2021%2010.1s15.9-3.6%2021-10.1l133.3-170.9c1.3-6.3.1-12.4-3.6-17.3z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 10px top 50%;
  background-size: 12px;
  padding-right: 30px; /* Tạo không gian cho icon */
}

.payment-methods {
  margin-top: 30px;
  margin-bottom: 30px;
}

.payment-methods .radio-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.payment-methods input[type="radio"] {
  margin-right: 10px;
  transform: scale(1.2); /* Phóng to radio button */
}

.payment-methods label {
  font-size: 1.1em;
  color: var(--text-color);
}

.btn-place-order {
  background-color: var(--primary-color);
  color: #fff;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: 100%;
  margin-top: 20px;
}

.btn-place-order:hover:not(:disabled) {
  background-color: darken(var(--primary-color), 10%);
  transform: translateY(-2px);
}

.btn-place-order:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.order-message {
  padding: 10px 15px;
  margin-top: 20px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}

.order-message.error {
  background-color: #ffe6e6;
  color: #cc0000;
  border: 1px solid #cc0000;
}

.order-message.success {
  background-color: #e6ffe6;
  color: #008000;
  border: 1px solid #008000;
}

.order-summary-section {
  flex: 1;
  min-width: 300px;
  background-color: #f9f9f9;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  height: fit-content;
}

.order-summary-section h2 {
  font-size: 1.8em;
  color: var(--primary-color);
  margin-bottom: 20px;
  font-family: var(--font-family-heading);
  text-align: center;
}

.order-items-summary {
  max-height: 300px; /* Giới hạn chiều cao và thêm scroll */
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 10px; /* Để tránh scrollbar che nội dung */
}

.summary-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee;
}

.summary-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.summary-item-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 15px;
}

.summary-item-info {
  flex-grow: 1;
  text-align: left;
}

.summary-item-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 5px;
}

.summary-item-qty-price {
  font-size: 0.9em;
  color: var(--light-text-color);
}

.summary-item-total {
  font-weight: bold;
  color: var(--accent-color);
  font-size: 1.1em;
}

.summary-totals p {
  display: flex;
  justify-content: space-between;
  font-size: 1.1em;
  margin-bottom: 10px;
  color: var(--text-color);
}

.summary-totals p span {
  font-weight: bold;
  color: var(--primary-color);
}

.summary-totals hr {
  border: 0;
  border-top: 1px dashed var(--border-color);
  margin: 15px 0;
}

.grand-total {
  font-size: 1.5em !important;
  font-weight: bold;
  color: var(--accent-color) !important;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .shipping-payment-section, .order-summary-section {
    min-width: unset;
    width: 100%;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 20px;
  }
  .checkout-page h1 {
    font-size: 2.5em;
  }
  .shipping-payment-section h2, .order-summary-section h2 {
    font-size: 1.5em;
  }
}
</style>
