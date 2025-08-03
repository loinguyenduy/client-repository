<template>
  <div class="product-detail-page">
    <div class="container">
      <div v-if="isLoading" class="loading-spinner">Loading product details...</div>

      <div v-else-if="error" class="error-message">
        {{ error }}
        <router-link to="/menu" class="btn-back-to-menu">Back to Menu</router-link>
      </div>

      <div v-else-if="product" class="product-detail-card">
        <div class="product-image-container">
          <img :src="getBackendImageUrl(product.image)" :alt="product.name" class="product-detail-image" />
        </div>
        <div class="product-info-container">
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-category">Category: {{ product.category ? product.category.name : 'N/A' }}</p>
          <p class="product-price">${{ product.price.toFixed(2) }}</p>
          <p class="product-description">{{ product.description }}</p>

          <div class="quantity-selector">
            <label for="quantity">Quantity:</label>
            <div class="quantity-input-group">
              <button @click="decrementQuantity" :disabled="quantity <= 1" class="quantity-button">-</button>
              <input type="number" id="quantity" v-model.number="quantity" min="1" class="quantity-input" />
              <button @click="incrementQuantity" class="quantity-button">+</button>
            </div>
          </div>

          <button 
            @click="handleAddToCart" 
            :disabled="isAddingToCart || !isLoggedIn" 
            class="btn-add-to-cart"
          >
            <span v-if="isAddingToCart">Adding...</span>
            <span v-else-if="!isLoggedIn">Login to Add to Cart</span>
            <span v-else>Add to Cart</span>
          </button>
          
          <div v-if="addToCartMessage" :class="['add-to-cart-message', addToCartMessageType]">
            {{ addToCartMessage }}
          </div>

          <router-link to="/menu" class="btn-back-to-menu">Back to Menu</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/helpers/api';
import { mapGetters, mapActions } from 'vuex';

export default {
  name: 'ProductDetailPage',
  props: ['id'], 
  data() {
    return {
      product: null,
      quantity: 1, 
      isLoading: true,
      error: null,
      isAddingToCart: false, 
      addToCartMessage: '', 
      addToCartMessageType: '', 
    };
  },
  computed: {
    ...mapGetters('user', ['isLoggedIn']),
  },
  async created() {
    await this.fetchProductDetails();
  },
  methods: {
    ...mapActions('cart', ['addToCart']),

    getBackendImageUrl(imagePath) {
      const backendBaseUrl = apiClient.defaults.baseURL.replace('/api', '');
      if (!imagePath || imagePath === '/uploads/placeholder.jpg') {
        return 'https://via.placeholder.com/400x300/f0f0f0/cccccc?text=No+Image'; 
      }
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      return `${backendBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    },

    async fetchProductDetails() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/products/${this.id}`);
        this.product = response.data;
      } catch (err) {
        console.error('Error fetching product details:', err);
        this.error = err.response?.data?.message || 'Failed to load product details. Product not found or server error.';
        this.product = null; 
      } finally {
        this.isLoading = false;
      }
    },

    incrementQuantity() {
      this.quantity++;
    },

    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },

    async handleAddToCart() {
      this.addToCartMessage = '';
      this.addToCartMessageType = '';

      if (!this.isLoggedIn) {
        this.addToCartMessage = 'You need to login to add items to cart.';
        this.addToCartMessageType = 'error';
        setTimeout(() => {
          this.$router.push('/login');
        }, 1500); 
        return;
      }

      this.isAddingToCart = true;
      try {
        await this.addToCart({ productId: this.product._id, quantity: this.quantity });
        this.addToCartMessage = `${this.product.name} added to cart successfully!`;
        this.addToCartMessageType = 'success';
        this.quantity = 1; 
      } catch (err) {
        console.error('Error adding to cart:', err);
        this.addToCartMessage = err.message || 'Failed to add product to cart. Please try again.';
        this.addToCartMessageType = 'error';
      } finally {
        this.isAddingToCart = false;
      }
    },
  },
  watch: {
    id: 'fetchProductDetails',
  },
};
</script>

<style scoped>
.product-detail-page {
  background-color: var(--bg-light);
  padding: 40px 20px;
  min-height: calc(100vh - 150px); 
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.container {
  max-width: 1000px;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  display: flex;
  flex-wrap: wrap; 
  gap: 40px;
}

.loading-spinner, .error-message {
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

.product-detail-card {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  width: 100%;
}

.product-image-container {
  flex: 1;
  min-width: 300px; 
  max-width: 45%; 
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-detail-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.product-info-container {
  flex: 1;
  min-width: 400px; 
  max-width: 50%; 
  text-align: left;
}

.product-name {
  font-size: 2.8em;
  color: var(--primary-color);
  margin-bottom: 10px;
  font-family: var(--font-family-heading);
}

.product-category {
  font-size: 1.1em;
  color: var(--light-text-color);
  margin-bottom: 15px;
}

.product-price {
  font-size: 2em;
  color: var(--accent-color);
  font-weight: bold;
  margin-bottom: 25px;
}

.product-description {
  font-size: 1.1em;
  color: var(--text-color);
  line-height: 1.6;
  margin-bottom: 30px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.quantity-selector label {
  font-size: 1.1em;
  font-weight: 600;
  color: var(--text-color);
  margin-right: 15px;
}

.quantity-input-group {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.quantity-button {
  background-color: #f0f0f0;
  border: none;
  padding: 10px 15px;
  font-size: 1.2em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.quantity-button:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.quantity-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.quantity-input {
  width: 60px;
  padding: 10px 0;
  text-align: center;
  border: none;
  font-size: 1.1em;
  -moz-appearance: textfield;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.btn-add-to-cart {
  background-color: var(--primary-color);
  color: #fff;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.2em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  width: auto;
  margin-right: 20px; 
}

.btn-add-to-cart:hover:not(:disabled) {
  background-color: darken(var(--primary-color), 10%);
  transform: translateY(-2px);
}

.btn-add-to-cart:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.8;
}

.btn-back-to-menu {
  display: inline-block;
  background-color: #6c757d;
  color: #fff;
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.2em;
  transition: background-color 0.3s ease;
}

.btn-back-to-menu:hover {
  background-color: darken(#6c757d, 10%);
}

.add-to-cart-message {
  padding: 10px 15px;
  margin-top: 20px;
  border-radius: 8px;
  font-weight: 500;
  text-align: left;
}

.add-to-cart-message.error {
  background-color: #ffe6e6;
  color: #cc0000;
  border: 1px solid #cc0000;
}

.add-to-cart-message.success {
  background-color: #e6ffe6;
  color: #008000;
  border: 1px solid #008000;
}

@media (max-width: 992px) {
  .product-image-container, .product-info-container {
    max-width: 100%; 
    min-width: unset; 
  }
  .product-image-container {
    order: 1; 
  }
  .product-info-container {
    order: 2; 
    text-align: center;
  }
  .product-name {
    font-size: 2.2em;
  }
  .product-price {
    font-size: 1.8em;
  }
  .quantity-selector {
    justify-content: center; 
  }
  .btn-add-to-cart, .btn-back-to-menu {
    width: 100%; 
    margin-right: 0;
    margin-bottom: 15px; 
  }
}

@media (max-width: 576px) {
  .container {
    padding: 20px;
  }
  .product-name {
    font-size: 1.8em;
  }
  .product-price {
    font-size: 1.5em;
  }
  .product-description {
    font-size: 1em;
  }
}
</style>