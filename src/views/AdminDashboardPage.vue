<template>
  <div class="admin-dashboard-page">
    <div class="container">
      <h1>Welcome, Admin!</h1>
      <p class="tagline">Manage your restaurant operations efficiently.</p>

      <div class="dashboard-grid">
        <router-link to="/admin/orders" class="dashboard-card">
          <i class="fas fa-clipboard-list"></i>
          <h3>Manage Orders</h3>
          <p>View and update all customer orders.</p>
        </router-link>

        <router-link to="/admin/products" class="dashboard-card">
          <i class="fas fa-utensils"></i>
          <h3>Manage Products</h3>
          <p>Add, edit, or delete dishes on your menu.</p>
        </router-link>

        <router-link to="/admin/categories" class="dashboard-card">
          <i class="fas fa-tags"></i>
          <h3>Manage Categories</h3>
          <p>Organize your menu categories.</p>
        </router-link>

        <router-link to="/admin/users" class="dashboard-card">
          <i class="fas fa-users"></i>
          <h3>Manage Users</h3>
          <p>View and manage user accounts.</p>
        </router-link>
      </div>

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <button @click="goToCreateProduct" class="btn-quick-action">
          <i class="fas fa-plus-circle"></i> Add New Product
        </button>
        <button @click="goToAdminOrders" class="btn-quick-action">
          <i class="fas fa-eye"></i> View All Orders
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'AdminDashboardPage',
  computed: {
    ...mapGetters('user', ['isAdmin']),
  },
  created() {
    if (!this.isAdmin) {
      alert('You are not authorized to view this page.');
      this.$router.push('/');
    }
  },
  methods: {
    goToCreateProduct() {
      this.$router.push('/admin/products/new');
    },
    goToAdminOrders() {
      this.$router.push('/admin/orders');
    },
  },
};
</script>

<style scoped>
.admin-dashboard-page {
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
  text-align: center;
}

.admin-dashboard-page h1 {
  font-size: 3em;
  color: var(--primary-color);
  margin-bottom: 15px;
  font-family: var(--font-family-heading);
}

.tagline {
  font-size: 1.2em;
  color: var(--light-text-color);
  margin-bottom: 40px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.dashboard-card {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-decoration: none;
  color: var(--text-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  background-color: #eef; 
}

.dashboard-card i {
  font-size: 3em;
  color: var(--accent-color);
  margin-bottom: 20px;
}

.dashboard-card h3 {
  font-size: 1.5em;
  color: var(--primary-color);
  margin-bottom: 10px;
  font-family: var(--font-family-heading);
}

.dashboard-card p {
  font-size: 0.95em;
  color: var(--light-text-color);
  line-height: 1.5;
}

.quick-actions {
  margin-top: 50px;
  border-top: 1px dashed var(--border-color);
  padding-top: 40px;
}

.quick-actions h2 {
  font-size: 2em;
  color: var(--text-color);
  margin-bottom: 30px;
  font-family: var(--font-family-heading);
}

.btn-quick-action {
  background-color: var(--primary-color);
  color: #fff;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn-quick-action i {
  font-size: 1.2em;
}

.btn-quick-action:hover {
  background-color: darken(var(--primary-color), 10%);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .btn-quick-action {
    width: 100%;
    margin: 10px 0;
  }
}
</style>
