<template>
  <div class="menu-page">
    <div class="container">
      <h1>Our Delicious Menu</h1>

      <div class="controls-bar">
        <div class="search-input-group">
          <input type="text" v-model.trim="searchKeyword" @keyup.enter="applyFilters" placeholder="Search for dishes..." class="search-input" />
          <button @click="applyFilters" class="search-button">
            <i class="fas fa-search"></i>
          </button>
        </div>

        <div class="filter-group"> 
          <select v-model="selectedCategory" @change="applyFilters" class="filter-select">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category._id" :value="category.name">
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="isLoadingProducts" class="loading-spinner">Loading menu...</div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="products.length === 0" class="no-products-message">
        <p>No products found matching your criteria.</p>
        <button @click="resetFilters" class="btn-primary">Reset Filters</button>
      </div>

      <div v-else class="product-grid">
        <div v-for="product in products" :key="product._id" class="product-card">
          <img :src="getBackendImageUrl(product.image)" :alt="product.name" class="product-image" />
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-category">{{ product.category?.name || 'Uncategorized' }}</p>
          <p class="product-price">${{ product.price.toFixed(2) }}</p>
          <div class="product-actions">
            <router-link :to="`/products/${product._id}`" class="btn-view-details">View Details</router-link>
            <button @click="handleAddToCart(product)" :disabled="isAddingToCartMap[product._id]" class="btn-add-to-cart">
              <span v-if="isAddingToCartMap[product._id]">Adding...</span>
              <span v-else-if="!isLoggedIn">Login to Add</span>
              <span v-else>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pagination-controls">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="pagination-button"
        >
          Previous
        </button>
        <span class="page-info"
          >Page {{ currentPage }} of {{ totalPages }}</span
        >
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/helpers/api';
import { mapGetters, mapActions } from 'vuex';
import Swal from 'sweetalert2'; 
export default {
  name: 'MenuPage',
  data() {
    return {
      products: [],
      categories: [],
      isLoadingProducts: true,
      error: null,
      searchKeyword: '',
      selectedCategory: '',
      currentPage: 1,
      totalPages: 1,
      limit: 10,
      isAddingToCartMap: {}, 
    };
  },
  computed: {
    ...mapGetters("user", ["isLoggedIn"]),
  },
  async created() {
    await this.fetchCategories();
    await this.fetchProducts();
  },
  methods: {
    ...mapActions('cart', ['addToCart']),

    getBackendImageUrl(imagePath) {
      const backendBaseUrl = apiClient.defaults.baseURL.replace('/api', '');
      if (!imagePath || imagePath === '/uploads/placeholder.jpg') {
        return 'https://via.placeholder.com/250x180/f0f0f0/cccccc?text=No+Image'; 
      }
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      return `${backendBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    },

    async fetchCategories() {
      this.isLoadingCategories = true;
      try {
        const response = await apiClient.get('/categories');
        this.categories = response.data;
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        this.isLoadingCategories = false;
      }
    },

    async fetchProducts() {
      this.isLoadingProducts = true;
      this.error = null;
      try {
        const params = {
          page: this.currentPage,
          limit: this.limit,
        };

        if (this.searchKeyword) {
          params.keyword = this.searchKeyword;
        }
        if (this.selectedCategory) {
          params.category = this.selectedCategory;
        }
        
        const response = await apiClient.get('/products', { params });
        this.products = response.data.products;
        this.currentPage = response.data.page;
        this.totalPages = response.data.pages;
      } catch (err) {
        console.error('Error fetching products:', err);
        this.error = err.response?.data?.message || 'Failed to load menu. Server error.';
        this.products = [];
      } finally {
        this.isLoadingProducts = false;
      }
    },

    applyFilters() {
      this.currentPage = 1;
      this.fetchProducts();
    },

    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchProducts();
      }
    },

    resetFilters() {
      this.searchKeyword = '';
      this.selectedCategory = '';
      this.currentPage = 1;
      this.fetchProducts();
    },

    async handleAddToCart(product) {
      this.isAddingToCartMap[product._id] = true;

      if (!this.isLoggedIn) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'Please login to add items. Redirecting...',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
        }).then(() => {
          this.$router.push({ path: "/login", query: { redirect: this.$route.fullPath } });
          this.isAddingToCartMap[product._id] = false; 
        });
        return;
      }

      try {
        await this.addToCart({ productId: product._id, quantity: 1 });
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `${product.name} added to cart!`,
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      } catch (err) {
        console.error('Error adding to cart:', err);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: err.message || 'Failed to add product to cart. Please try again.',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
        });
      } finally {
        this.isAddingToCartMap[product._id] = false;
      }
    },
  },
};
</script>

<style scoped>
.menu-page {
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

.menu-page h1 {
  text-align: center;
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.controls-bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.search-input-group {
  display: flex;
  flex-grow: 1;
  max-width: 400px;
}

.search-input {
  flex-grow: 1;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px 0 0 8px;
  font-size: 1em;
  outline: none;
  transition: border-color 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.search-button {
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  padding: 12px 18px;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-button:hover {
  background-color: darken(var(--primary-color), 10%);
}

.filter-group { 
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-select { 
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  outline: none;
  appearance: none; 
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23A0522D%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-6.5%200-12.3%203.2-16.1%208.1-3.7%204.9-4.9%2011-3.6%2017.3l133.3%20170.9c5.1%206.5%2012.8%2010.1%2021%2010.1s15.9-3.6%2021-10.1l133.3-170.9c1.3-6.3.1-12.4-3.6-17.3z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 1.2em;
  padding-right: 40px; 
  cursor: pointer;
}

.loading-spinner, .error-message, .no-products-message {
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

.no-products-message .btn-primary {
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

.no-products-message .btn-primary:hover {
  background-color: darken(var(--primary-color), 10%);
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.product-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  padding: 20px;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.12);
}

.product-image {
  width: 100%;
  height: 180px; 
  object-fit: cover; 
  border-radius: 8px;
  margin-bottom: 15px;
}

.product-name {
  font-size: 1.4em;
  color: var(--text-color);
  margin-bottom: 5px;
  font-family: var(--font-family-heading);
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
}

.product-category {
  font-size: 0.9em;
  color: var(--light-text-color);
  margin-bottom: 10px;
}

.product-price {
  font-size: 1.2em;
  color: var(--primary-color);
  font-weight: bold;
  margin-bottom: 20px;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto; 
}

.btn-view-details {
  display: inline-block;
  background-color: #6c757d; 
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  flex-grow: 1; 
  text-align: center;
}

.btn-view-details:hover {
  background-color: darken(#6c757d, 10%);
}

.btn-add-to-cart {
  background-color: var(--accent-color);
  color: var(--text-color);
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-grow: 1; 
}

.btn-add-to-cart:hover:not(:disabled) {
  background-color: darken(var(--accent-color), 10%);
}

.btn-add-to-cart:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
  gap: 15px;
}

.pagination-button {
  background-color: var(--primary-color);
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.pagination-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.pagination-button:hover:not(:disabled) {
  background-color: darken(var(--primary-color), 10%);
}

.page-info {
  font-size: 1.1em;
  color: var(--text-color);
  font-weight: 500;
}

.loading-spinner,
.no-products-message {
  font-size: 1.2em;
  color: var(--light-text-color);
  text-align: center;
  margin-top: 40px;
}

@media (max-width: 992px) {
  .controls-bar {
    flex-direction: column;
    gap: 20px;
  }
  .search-input-group {
    width: 100%;
    max-width: 100%;
  }
  .filter-group { 
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr; 
  }
}
</style>
