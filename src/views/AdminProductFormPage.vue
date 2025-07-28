<!-- frontend/src/views/AdminProductFormPage.vue -->
<template>
  <div class="admin-product-form-page">
    <div class="container">
      <h1>{{ isEditMode ? 'Edit Product' : 'Create New Product' }}</h1>

      <!-- Hiển thị thông báo loading hoặc lỗi -->
      <div v-if="isLoading" class="loading-spinner">Loading product data...</div>
      <div v-else-if="error" class="error-message">
        {{ error }}
        <router-link to="/admin/products" class="btn-back-to-list">Back to Product List</router-link>
      </div>

      <!-- Product Form -->
      <form v-else @submit.prevent="handleSubmit" class="product-form">
        <div class="form-group">
          <label for="name">Product Name:</label>
          <input type="text" id="name" v-model="product.name" required />
        </div>

        <div class="form-group">
          <label for="description">Description:</label>
          <textarea id="description" v-model="product.description" rows="5"></textarea>
        </div>

        <div class="form-group">
          <label for="price">Price:</label>
          <input type="number" id="price" v-model.number="product.price" step="0.01" required min="0" />
        </div>

        <div class="form-group">
          <label for="category">Category:</label>
          <select id="category" v-model="product.category" required>
            <option value="" disabled>Select a category</option>
            <option v-for="category in categories" :key="category._id" :value="category._id">
              {{ category.name }}
            </option>
          </select>
          <div v-if="categories.length === 0 && !isLoadingCategories" class="info-message">
            No categories found. Please create categories first.
            <router-link to="/admin/categories" class="btn-link">Manage Categories</router-link>
          </div>
        </div>

        <div class="form-group">
          <label for="image">Product Image:</label>
          <input type="file" id="image" @change="handleImageUpload" accept="image/*" />
          <div v-if="product.image" class="image-preview-container">
            <img :src="getBackendImageUrl(product.image)" alt="Product Image Preview" class="image-preview" />
            <p class="image-path">{{ product.image }}</p>
          </div>
        </div>

        <div class="form-group checkbox-group">
          <input type="checkbox" id="isFeatured" v-model="product.isFeatured" />
          <label for="isFeatured">Is Featured?</label>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting" class="btn-submit">
            <span v-if="isSubmitting">{{ isEditMode ? 'Updating...' : 'Creating...' }}</span>
            <span v-else>{{ isEditMode ? 'Update Product' : 'Create Product' }}</span>
          </button>
          <router-link to="/admin/products" class="btn-cancel">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import apiClient from '@/helpers/api';
import { mapGetters } from 'vuex';

export default {
  name: 'AdminProductFormPage',
  props: ['id'], // Nhận product ID từ URL route khi ở chế độ chỉnh sửa
  data() {
    return {
      product: {
        name: '',
        description: '',
        price: 0,
        category: '', // Sẽ lưu _id của category
        image: '/uploads/placeholder.jpg', // Mặc định ảnh placeholder
        isFeatured: false,
      },
      categories: [],
      selectedFile: null, // File ảnh được chọn
      isLoading: true,
      isLoadingCategories: true,
      isSubmitting: false,
      error: null,
    };
  },
  computed: {
    ...mapGetters('user', ['isAdmin']),
    isEditMode() {
      return !!this.id; // Nếu có ID trong props, đây là chế độ chỉnh sửa
    },
  },
  async created() {
    // Kiểm tra quyền admin
    if (!this.isAdmin) {
      alert('You are not authorized to view this page. Admin access required.');
      this.$router.push('/');
      return;
    }

    // Fetch categories trước tiên
    await this.fetchCategories();

    // Nếu ở chế độ chỉnh sửa, fetch dữ liệu sản phẩm hiện có
    if (this.isEditMode) {
      await this.fetchProductDetails(this.id);
    } else {
      this.isLoading = false; // Không cần loading nếu là tạo mới
    }
  },
  methods: {
    // Hàm để lấy URL hình ảnh đầy đủ từ backend
    getBackendImageUrl(imagePath) {
      const backendBaseUrl = apiClient.defaults.baseURL.replace('/api', '');
      if (!imagePath || imagePath === '/uploads/placeholder.jpg') {
        return 'https://via.placeholder.com/150x150/f0f0f0/cccccc?text=No+Image'; 
      }
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
      }
      return `${backendBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    },

    // Fetch danh sách danh mục
    async fetchCategories() {
      this.isLoadingCategories = true;
      try {
        const response = await apiClient.get('/categories');
        this.categories = response.data;
      } catch (err) {
        console.error('Error fetching categories:', err);
        this.error = err.response?.data?.message || 'Failed to load categories.';
      } finally {
        this.isLoadingCategories = false;
      }
    },

    // Fetch chi tiết sản phẩm khi ở chế độ chỉnh sửa
    async fetchProductDetails(productId) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get(`/products/${productId}`);
        // Gán dữ liệu sản phẩm vào form. Đảm bảo category là _id
        this.product = {
          ...response.data,
          category: response.data.category?._id || '', // Lấy _id của category
        };
      } catch (err) {
        console.error('Error fetching product details:', err);
        this.error = err.response?.data?.message || 'Failed to load product details.';
      } finally {
        this.isLoading = false;
      }
    },

    // Xử lý khi chọn file ảnh
    handleImageUpload(event) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile) {
        // Tạo URL tạm thời để hiển thị preview ảnh
        this.product.image = URL.createObjectURL(this.selectedFile);
      } else {
        this.product.image = '/uploads/placeholder.jpg';
      }
    },

    // Xử lý gửi form
    async handleSubmit() {
      this.isSubmitting = true;
      this.error = null;

      // Tạo FormData để gửi dữ liệu và file ảnh
      const formData = new FormData();
      for (const key in this.product) {
        // Bỏ qua trường image nếu không có file mới được chọn và không phải placeholder
        if (key === 'image' && !this.selectedFile) {
          continue; 
        }
        // Nếu là image và có file mới, thì thêm file vào formData
        if (key === 'image' && this.selectedFile) {
          formData.append(key, this.selectedFile);
        } else if (key === 'category' && this.product[key]) {
          // Đảm bảo gửi category ID
          formData.append(key, this.product[key]);
        }
        else if (key === 'price') {
            formData.append(key, parseFloat(this.product[key]));
        }
        else if (key === 'isFeatured') {
            formData.append(key, this.product[key]);
        }
        else {
          formData.append(key, this.product[key]);
        }
      }

      try {
        let response;
        if (this.isEditMode) {
          // Chế độ chỉnh sửa (PUT)
          response = await apiClient.put(`/products/${this.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data', // Quan trọng khi gửi FormData
            },
          });
          alert('Product updated successfully!');
        } else {
          // Chế độ tạo mới (POST)
          response = await apiClient.post('/products', formData, {
            headers: {
              'Content-Type': 'multipart/form-data', // Quan trọng khi gửi FormData
            },
          });
          alert('Product created successfully!');
        }
        console.log('Product saved:', response.data);
        this.$router.push('/admin/products'); // Chuyển hướng về danh sách sản phẩm
      } catch (err) {
        console.error('Error saving product:', err);
        this.error = err.response?.data?.message || 'Failed to save product. Server error.';
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
/* CSS cho trang form sản phẩm của Admin */
.admin-product-form-page {
  background-color: var(--bg-light);
  padding: 40px 20px;
  min-height: calc(100vh - 150px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.container {
  max-width: 800px;
  width: 100%;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.admin-product-form-page h1 {
  text-align: center;
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
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
  margin-bottom: 20px;
}

.btn-back-to-list {
  display: inline-block;
  background-color: #6c757d;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  margin-top: 15px;
}

.btn-back-to-list:hover {
  background-color: darken(#6c757d, 10%);
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 1.1em;
  color: var(--text-color);
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group input[type="number"]:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
  outline: none;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-group select {
  appearance: none; /* Remove default select arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23A0522D'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 1.2em;
  padding-right: 40px;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.checkbox-group input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: var(--primary-color); /* Color for checkbox */
  cursor: pointer;
}

.image-preview-container {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: 1px dashed var(--border-color);
  padding: 15px;
  border-radius: 8px;
  background-color: #fcfcfc;
}

.image-preview {
  max-width: 150px;
  max-height: 150px;
  object-fit: contain;
  border-radius: 5px;
  border: 1px solid #eee;
}

.image-path {
  font-size: 0.9em;
  color: var(--light-text-color);
  word-break: break-all;
  text-align: center;
}

.info-message {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #e0f7fa;
  border: 1px solid #00bcd4;
  border-radius: 8px;
  color: #00838f;
  font-size: 0.95em;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-message .btn-link {
  color: #00838f;
  font-weight: bold;
  text-decoration: underline;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.btn-submit, .btn-cancel {
  padding: 12px 25px;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  border: none;
}

.btn-submit {
  background-color: var(--primary-color);
  color: #fff;
}

.btn-submit:hover:not(:disabled) {
  background-color: darken(var(--primary-color), 10%);
  transform: translateY(-2px);
}

.btn-submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: var(--text-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel:hover {
  background-color: darken(#f0f0f0, 5%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    padding: 25px;
  }
  .admin-product-form-page h1 {
    font-size: 2.5em;
    margin-bottom: 25px;
  }
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .btn-submit, .btn-cancel {
    width: 100%;
  }
}
</style>
