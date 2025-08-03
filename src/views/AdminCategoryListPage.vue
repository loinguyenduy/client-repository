<template>
  <div class="admin-category-list-page">
    <div class="container">
      <h1>Category Management</h1>

      <form @submit.prevent="handleSubmit" class="category-form">
        <div class="form-group">
          <label for="categoryName">{{ isEditMode ? 'Edit Category Name:' : 'New Category Name:' }}</label>
          <input type="text" id="categoryName" v-model="newCategoryName" required />
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="isSubmitting" class="btn-submit">
            <span v-if="isSubmitting">{{ isEditMode ? 'Updating...' : 'Adding...' }}</span>
            <span v-else>{{ isEditMode ? 'Update Category' : 'Add Category' }}</span>
          </button>
          <button v-if="isEditMode" @click="cancelEdit" type="button" class="btn-cancel">Cancel Edit</button>
        </div>
        <div v-if="formError" class="form-error-message">{{ formError }}</div>
      </form>

      <div v-if="isLoading" class="loading-spinner">Loading categories...</div>
      <div v-else-if="error" class="error-message">
        {{ error }}
        <router-link to="/admin/dashboard" class="btn-back-dashboard">Back to Dashboard</router-link>
      </div>
      <div v-else-if="categories.length === 0 && !isLoading" class="no-categories-message">
        No categories found. Add a new category above.
      </div>

      <div v-else class="categories-table-container">
        <table class="categories-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category._id">
              <td>{{ category._id }}</td>
              <td>{{ category.name }}</td>
              <td class="actions-cell">
                <button @click="startEdit(category)" class="btn-action btn-edit">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button @click="confirmDelete(category._id)" class="btn-action btn-delete">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import apiClient from '@/helpers/api';
import { mapGetters } from 'vuex';
import Swal from 'sweetalert2'; 
export default {
  name: 'AdminCategoryListPage',
  data() {
    return {
      categories: [],
      newCategoryName: '',
      editingCategoryId: null, 
      isLoading: true,
      isSubmitting: false,
      error: null,
      formError: null, 
    };
  },
  computed: {
    ...mapGetters('user', ['isAdmin']),
    isEditMode() {
      return !!this.editingCategoryId; 
    },
  },
  async created() {
    if (!this.isAdmin) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized Access',
        text: 'You are not authorized to view this page. Admin access required.',
        confirmButtonColor: '#A0522D',
      }).then(() => {
        this.$router.push('/');
      });
      return;
    }
    await this.fetchAllCategories();
  },
  methods: {
    async fetchAllCategories() {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await apiClient.get('/categories');
        this.categories = response.data;
      } catch (err) {
        console.error('Error fetching categories:', err); 
        this.error = err.response?.data?.message || 'Failed to load categories. Server error.';
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Categories',
          text: this.error,
          confirmButtonColor: '#A0522D',
        });
      } finally {
        this.isLoading = false;
      }
    },

    startEdit(category) {
      this.editingCategoryId = category._id;
      this.newCategoryName = category.name;
      this.formError = null; 
    },

    cancelEdit() {
      this.editingCategoryId = null;
      this.newCategoryName = '';
      this.formError = null;
    },

    async handleSubmit() {
      this.isSubmitting = true;
      this.formError = null; 

      if (!this.newCategoryName.trim()) {
        this.formError = 'Category name cannot be empty.';
        this.isSubmitting = false;
        return;
      }

      try {
        if (this.isEditMode) {
          await apiClient.put(`/categories/${this.editingCategoryId}`, { name: this.newCategoryName });
          Swal.fire({
            icon: 'success',
            title: 'Category Updated!',
            text: 'Category has been updated successfully.',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            confirmButtonColor: '#A0522D',
          });
        } else {
          await apiClient.post('/categories', { name: this.newCategoryName });
          Swal.fire({
            icon: 'success',
            title: 'Category Added!',
            text: 'New category has been added successfully.',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            confirmButtonColor: '#A0522D',
          });
        }
        this.newCategoryName = ''; 
        this.editingCategoryId = null; 
        await this.fetchAllCategories(); 
      } catch (err) {
        console.error('Error saving category:', err);
        this.formError = err.response?.data?.message || 'Failed to save category. Server error.';
        Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: this.formError,
          confirmButtonColor: '#A0522D',
        });
      } finally {
        this.isSubmitting = false;
      }
    },

    async confirmDelete(categoryId) {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You are about to delete this category. This action cannot be undone and may affect products linked to it!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545', 
        cancelButtonColor: '#6c757d', 
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
      });

      if (result.isConfirmed) {
        this.deleteCategory(categoryId);
      }
    },

    async deleteCategory(categoryId) {
      this.isLoading = true; 
      this.error = null;
      try {
        await apiClient.delete(`/categories/${categoryId}`);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Category has been deleted successfully.',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          confirmButtonColor: '#A0522D',
        });
        await this.fetchAllCategories(); 
      } catch (err) {
        console.error(`Error deleting category ${categoryId}:`, err); 
        this.error = err.response?.data?.message || 'Failed to delete category. Server error.';
        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed',
          text: this.error,
          confirmButtonColor: '#A0522D',
        });
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.admin-category-list-page {
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

.admin-category-list-page h1 {
  text-align: center;
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 40px;
  font-family: var(--font-family-heading);
}

.category-form {
  margin-bottom: 40px;
  padding: 30px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: #fcfcfc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 1.1em;
  color: var(--text-color);
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input[type="text"] {
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  width: 100%;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input[type="text"]:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.2);
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
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
}

.btn-cancel:hover {
  background-color: darken(#f0f0f0, 5%);
}

.form-error-message {
  color: #cc0000;
  background-color: #ffe6e6;
  border: 1px solid #cc0000;
  border-radius: 8px;
  padding: 10px 15px;
  margin-top: 15px;
  font-size: 0.95em;
}

.loading-spinner, .error-message, .no-categories-message {
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

.categories-table-container {
  overflow-x: auto;
  margin-top: 40px;
}

.categories-table {
  width: 100%;
  border-collapse: collapse;
}

.categories-table th, .categories-table td {
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  text-align: left;
  vertical-align: middle;
}

.categories-table th {
  background-color: var(--primary-color);
  color: #fff;
  font-weight: bold;
  text-transform: uppercase;
  font-size: 0.9em;
}

.categories-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.categories-table tbody tr:hover {
  background-color: #f1f1f1;
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

@media (max-width: 768px) {
  .container {
    padding: 25px;
  }
  .admin-category-list-page h1 {
    font-size: 2.5em;
    margin-bottom: 25px;
  }
  .category-form {
    padding: 20px;
  }
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .btn-submit, .btn-cancel {
    width: 100%;
  }
  .categories-table th, .categories-table td {
    padding: 8px 10px;
    font-size: 0.9em;
  }
  .btn-action {
    padding: 6px 10px;
    font-size: 0.8em;
  }
}

@media (max-width: 480px) {
  .categories-table th, .categories-table td {
    font-size: 0.8em;
  }
  .btn-action {
    padding: 5px 8px;
    font-size: 0.75em;
  }
}
</style>
