<!-- frontend/src/views/MenuPage.vue -->
<template>
  <div class="menu-page">
    <div class="container">
      <h1>Our Delicious Menu</h1>

      <!-- Thanh tìm kiếm và Bộ lọc danh mục -->
      <div class="controls-bar">
        <div class="search-box">
          <input
            type="text"
            v-model="searchKeyword"
            @keyup.enter="applyFilters"
            placeholder="Search dishes by name..."
            class="search-input"
          />
          <button @click="applyFilters" class="search-button">
            <i class="fas fa-search"></i>
          </button>
        </div>

        <div class="filter-box">
          <label for="categoryFilter" class="filter-label"
            >Filter by Category:</label
          >
          <select
            id="categoryFilter"
            v-model="selectedCategory"
            @change="applyFilters"
            class="category-select"
          >
            <option value="All">All Categories</option>
            <option
              v-for="category in categories"
              :key="category._id"
              :value="category.name"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Hiển thị thông báo loading hoặc lỗi -->
      <div v-if="isLoadingProducts" class="loading-spinner">
        Loading menu...
      </div>
      <div v-else-if="products.length === 0" class="no-products-message">
        No dishes found matching your criteria.
      </div>

      <!-- Danh sách sản phẩm -->
      <div v-else class="product-grid">
        <div
          v-for="product in products"
          :key="product._id"
          class="product-card"
        >
          <img
            :src="getBackendImageUrl(product.image)"
            :alt="product.name"
            class="product-image"
          />
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">
              {{ product.description.substring(0, 100) + "..." }}
            </p>
            <p class="product-price">${{ product.price.toFixed(2) }}</p>
            <div class="product-actions">
              <router-link :to="`/products/${product._id}`" class="btn-details"
                >View Details</router-link
              >
              <button
                @click="handleAddToCart(product)"
                :disabled="isAddingToCartMap[product._id]"
                class="btn-add-to-cart"
              >
                <span v-if="isAddingToCartMap[product._id]">Adding...</span>
                <span v-else-if="!isLoggedIn">Login to Add</span>
                <span v-else>Add to Cart</span>
              </button>
            </div>
            <!-- Thông báo thêm vào giỏ hàng cho từng sản phẩm -->
            <div
              v-if="addToCartMessageMap[product._id]"
              :class="[
                'add-to-cart-message',
                addToCartMessageTypeMap[product._id],
              ]"
            >
              {{ addToCartMessageMap[product._id] }}
            </div>
          </div>
        </div>
      </div>

      <!-- Phân trang -->
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
import apiClient from "@/helpers/api";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "MenuPage",
  data() {
    return {
      products: [],
      categories: [],
      searchKeyword: "",
      selectedCategory: "All",
      currentPage: 1,
      totalPages: 1,
      totalProducts: 0,
      limit: 10,
      isLoadingProducts: false,
      isLoadingCategories: false,
      isAddingToCartMap: {},
      addToCartMessageMap: {},
      addToCartMessageTypeMap: {},
    };
  },
  computed: {
    ...mapGetters("user", ["isLoggedIn"]),
  },
  async created() {
    await Promise.all([this.fetchCategories(), this.fetchProducts()]);
  },
  methods: {
    ...mapActions("cart", ["addToCart"]),

    getBackendImageUrl(imagePath) {
      const backendBaseUrl = apiClient.defaults.baseURL.replace("/api", "");
      if (!imagePath || imagePath === "/uploads/placeholder.jpg") {
        return "https://via.placeholder.com/200x200/f0f0f0/cccccc?text=No+Image";
      }
      if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
      }
      return `${backendBaseUrl}${
        imagePath.startsWith("/") ? "" : "/"
      }${imagePath}`;
    },

    async fetchCategories() {
      this.isLoadingCategories = true;
      try {
        const response = await apiClient.get("/categories");
        this.categories = response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        this.categories = [];
      } finally {
        this.isLoadingCategories = false;
      }
    },

    async fetchProducts() {
      this.isLoadingProducts = true;
      try {
        let url = `/products?page=${this.currentPage}&limit=${this.limit}`;
        if (this.searchKeyword) {
          url += `&keyword=${this.searchKeyword}`;
        }
        if (this.selectedCategory && this.selectedCategory !== "All") {
          url += `&category=${this.selectedCategory}`;
        }

        const response = await apiClient.get(url);
        this.products = response.data.products;
        this.currentPage = response.data.page;
        this.totalPages = response.data.pages;
        this.totalProducts = response.data.totalProducts;
      } catch (error) {
        console.error("Error fetching products:", error);
        this.products = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.totalProducts = 0;
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

    async handleAddToCart(product) {
      // Reset thông báo cho sản phẩm này
      // THAY THẾ this.$set BẰNG GÁN TRỰC TIẾP
      this.addToCartMessageMap[product._id] = "";
      this.addToCartMessageTypeMap[product._id] = "";

      if (!this.isLoggedIn) {
        // THAY THẾ this.$set BẰNG GÁN TRỰC TIẾP
        this.addToCartMessageMap[product._id] =
          "You need to login to add items to cart.";
        this.addToCartMessageTypeMap[product._id] = "error";

        this.$router.push("/login");
        return;
      }

      // THAY THẾ this.$set BẰNG GÁN TRỰC TIẾP
      this.isAddingToCartMap[product._id] = true;
      try {
        await this.addToCart({ productId: product._id, quantity: 1 });
        // THAY THẾ this.$set BẰNG GÁN TRỰC TIẾP
        this.addToCartMessageMap[
          product._id
        ] = `${product.name} added to cart!`;
        this.addToCartMessageTypeMap[product._id] = "success";

        setTimeout(() => {
          // THAY THẾ this.$set BẰNG GÁN TRỰC TIẾP
          this.addToCartMessageMap[product._id] = "";
        }, 3000);
      } catch (err) {
        console.error("Error adding to cart:", err);
        // THAY THẾ this.$set BẰNG GÁN TRỰC TIẾP
        this.addToCartMessageMap[product._id] =
          err.message || "Failed to add to cart.";
        this.addToCartMessageTypeMap[product._id] = "error";
      } finally {
        // THAY THẾ this.$set BẰNG GÁN TRỰC TIẾP
        this.isAddingToCartMap[product._id] = false;
      }
    },
  },
};
</script>

<style scoped>
/* CSS cho trang thực đơn */
.menu-page {
  background-color: var(--bg-light);
  padding: 40px 0;
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
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.search-box {
  display: flex;
  flex-grow: 1;
  margin-right: 20px;
}

.search-input {
  flex-grow: 1;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px 0 0 8px;
  font-size: 1em;
  outline: none;
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

.filter-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-weight: 600;
  color: var(--text-color);
  white-space: nowrap;
}

.category-select {
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1em;
  background-color: #fff;
  cursor: pointer;
  outline: none;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.product-card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  height: 220px; /* Chiều cao cố định cho ảnh */
  object-fit: cover;
}

.product-info {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 1.6em;
  color: var(--text-color);
  margin-bottom: 10px;
  font-family: var(--font-family-heading);
}

.product-description {
  font-size: 0.95em;
  color: var(--light-text-color);
  margin-bottom: 15px;
  line-height: 1.5;
}

.product-price {
  font-size: 1.3em;
  color: var(--primary-color);
  font-weight: bold;
  margin-bottom: 20px;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: auto; /* Đẩy xuống cuối card */
}

.btn-details {
  display: inline-block;
  background-color: #6c757d;
  color: #fff;
  padding: 10px 15px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  flex-grow: 1;
  text-align: center;
}

.btn-details:hover {
  background-color: darken(#6c757d, 10%);
}

.btn-add-to-cart {
  background-color: var(--accent-color);
  color: var(--text-color);
  padding: 10px 15px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-grow: 1;
}

.btn-add-to-cart:hover {
  background-color: darken(var(--accent-color), 10%);
}

/* Phân trang */
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

/* Thông báo thêm vào giỏ hàng */
.add-to-cart-message {
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 6px;
  font-size: 0.9em;
  font-weight: 500;
  text-align: center;
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

/* Responsive adjustments */
@media (max-width: 992px) {
  .controls-bar {
    flex-direction: column;
    gap: 20px;
  }
  .search-box {
    width: 100%;
    margin-right: 0;
  }
  .filter-box {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr; /* Một cột trên màn hình nhỏ */
  }
}
</style>
