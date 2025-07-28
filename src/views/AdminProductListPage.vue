<!-- frontend/src/views/AdminProductListPage.vue -->
<template>
  <div class="admin-product-list-page">
    <div class="container">
      <h1>Product Management</h1>

      <div class="actions-bar">
        <router-link to="/admin/products/new" class="btn-create-product">
          <i class="fas fa-plus"></i> Add New Product
        </router-link>
      </div>

      <!-- Display loading, error, or no products message -->
      <div v-if="isLoading" class="loading-spinner">Loading products...</div>
      <div v-else-if="error" class="error-message">
        {{ error }}
        <router-link to="/admin/dashboard" class="btn-back-dashboard">Back to Dashboard</router-link>
      </div>
      <div v-else-if="products.length === 0 && !isLoading" class="no-products-message">
        No products found in the system.
        <router-link to="/admin/products/new" class="btn-create-product-empty">
          Create Your First Product
        </router-link>
      </div>

      <!-- Products Table -->
      <div v-else class="products-table-container">
        <table class="products-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Featured</th> 
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products" :key="product._id">
              <td>{{ product._id }}</td>
              <td>
                <img :src="getBackendImageUrl(product.image)" :alt="product.name" class="product-thumbnail" />
              </td>
              <td>{{ product.name }}</td>
              <td>{{ product.category?.name || 'N/A' }}</td>
              <td>${{ product.price.toFixed(2) }}</td>
              <td>
                <i :class="['fas', product.isFeatured ? 'fa-star text-featured' : 'fa-minus-circle text-muted']"></i>
              </td>
              <td class="actions-cell">
                <router-link :to="`/admin/products/${product._id}/edit`" class="btn-action btn-edit">
                  <i class="fas fa-edit"></i> Edit
                </router-link>
                <button @click="confirmDelete(product._id)" class="btn-action btn-delete">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
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
import { mapGetters } from 'vuex';

export default {
  name: 'AdminProductListPage',
  data() {
    return {
      products: [],
      isLoading: true,
      error: null,
      currentPage: 1,    // Current page number
      totalPages: 1,     // Total number of pages
      totalProducts: 0,  // Total number of products
      limit: 10,         // Number of products per page
    };
  },
  computed: {
    ...mapGetters('user', ['isAdmin']), // Get admin status from user module
  },
  async created() {
    // Check admin rights before fetching products
    if (!this.isAdmin) {
      alert('You are not authorized to view this page. Admin access required.');
      this.$router.push('/'); // Redirect to home page if not admin
      return;
    }
    await this.fetchAllProducts();
  },
  methods: {
    // Function to get the full image URL from the backend
    getBackendImageUrl(imagePath) {
      const backendBaseUrl = apiClient.defaults.baseURL.replace('/api', '');
      if (!imagePath || imagePath === '/uploads/placeholder.jpg') {
        return 'https://via.placeholder.com/80x80/f0f0f0/cccccc?text=No+Image'; 
      }
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      return `${backendBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    },

    // Fetch all products from the backend (for admin, including pagination)
    async fetchAllProducts() {
      this.isLoading = true;
      this.error = null;
      try {
        // Call the unified /products API with pagination parameters
        const response = await apiClient.get(`/products?page=${this.currentPage}&limit=${this.limit}`); 
        
        this.products = response.data.products; 
        this.currentPage = response.data.page;      
        this.totalPages = response.data.pages;      
        this.totalProducts = response.data.totalProducts; 
        
      } catch (err) {
        console.error('AdminProductListPage: Error fetching all products (admin):', err);
        this.error = err.response?.data?.message || 'Failed to load products. Server error.';
        this.products = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalProducts = 0;
      } finally {
        this.isLoading = false;
      }
    },

    // Function to change page
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchAllProducts(); // Fetch products for the new page
      }
    },

    // Confirm product deletion
    confirmDelete(productId) {
      if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        this.deleteProduct(productId);
      }
    },

    // Delete product
    async deleteProduct(productId) {
      this.isLoading = true;
      this.error = null;
      try {
        await apiClient.delete(`/products/${productId}`); 
        alert('Product deleted successfully!');
        // After deletion, go back to the previous page if the current page becomes empty
        // or re-fetch the current page if there are still products
        if (this.products.length === 1 && this.currentPage > 1) {
            this.currentPage--;
        }
        await this.fetchAllProducts(); 
      } catch (err) {
        console.error(`AdminProductListPage: Error deleting product ${productId}:`, err);
        this.error = err.response?.data?.message || 'Failed to delete product. Server error.';
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
/* CSS for Admin Product List Page */
.admin-product-list-page {
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

.admin-product-list-page h1 {
  text-align: center;
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.actions-bar {
  text-align: right;
  margin-bottom: 25px;
}

.btn-create-product {
  display: inline-block;
  background-color: var(--accent-color);
  color: var(--text-color);
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 1.1em;
}

.btn-create-product:hover {
  background-color: darken(var(--accent-color), 10%);
  transform: translateY(-2px);
}

.btn-create-product i {
  margin-right: 8px;
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

.no-products-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.btn-create-product-empty {
  display: inline-block;
  background-color: var(--primary-color);
  color: #fff;
  padding: 12px 25px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.btn-create-product-empty:hover {
  background-color: darken(var(--primary-color), 10%);
}

.products-table-container {
  overflow-x: auto; 
}

.products-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.products-table th, .products-table td {
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  text-align: left;
  vertical-align: middle;
}

.products-table th {
  background-color: var(--primary-color);
  color: #fff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9em;
}

.products-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.products-table tbody tr:hover {
  background-color: #f1f1f1;
}

.product-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
}

.text-featured {
  color: #ffc107; 
}

.text-muted {
  color: #6c757d; 
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

.btn-edit {
  background-color: #007bff; 
  color: #fff;
}

.btn-edit:hover {
  background-color: darken(#007bff, 10%);
}

.btn-delete {
  background-color: #dc3545; 
  color: #fff;
}

.btn-delete:hover {
  background-color: darken(#dc3545, 10%);
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

/* Pagination */
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .products-table th, .products-table td {
    padding: 8px 10px;
    font-size: 0.9em;
  }

  .admin-product-list-page h1 {
    font-size: 2.5em;
  }

  .product-thumbnail {
    width: 60px;
    height: 60px;
  }

  .btn-action {
    padding: 6px 10px;
    font-size: 0.8em;
  }

  .actions-bar {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .products-table th, .products-table td {
    font-size: 0.8em;
  }
  .btn-action {
    padding: 5px 8px;
    font-size: 0.75em;
  }
}
</style>
