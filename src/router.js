import { createRouter, createWebHistory } from "vue-router";
import store from "./store/store";

//import web pages
import HomePage from "./views/HomePage.vue";
import LoginPage from "./views/LoginPage.vue";
import RegisterPage from "./views/RegisterPage.vue";
import ProfilePage from "./views/ProfilePage.vue";
import MenuPage from "./views/MenuPage.vue";
import ProductDetailPage from "./views/ProductDetailPage.vue";
import CartPage from "./views/CartPage.vue";
import CheckoutPage from "./views/CheckoutPage.vue";
import MyOrdersPage from "./views/MyOrdersPage.vue";
import OrderDetailsPage from "./views/OrderDetailsPage.vue";

import AdminUserListPage from "./views/AdminUserListPage.vue";
import AdminProductFormPage from "./views/AdminProductFormPage.vue";
import AdminProductListPage from "./views/AdminProductListPage.vue";
import AdminCategoryListPage from "./views/AdminCategoryListPage.vue";
import AdminOrderListPage from "./views/AdminOrderListPage.vue";
import AdminDashboardPage from "./views/AdminDashboardPage.vue";
import AdminOrderDetailsPage from "./views/AdminOrderDetailsPage.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },

  {
    path: "/login",
    name: "login",
    component: LoginPage,
  },

  {
    path: "/register",
    name: "register",
    component: RegisterPage,
  },

  {
    path: "/profile",
    name: "profile",
    component: ProfilePage,
    meta: { requiresAuth: true },
  },

  {
    path: "/menu",
    name: "menu",
    component: MenuPage,
  },

  {
    path: "/products/:id",
    name: "productDetail",
    component: ProductDetailPage,
    props: true,
  },

  {
    path: "/cart",
    name: "cart",
    component: CartPage,
    meta: { requiresAuth: true },
  },

  {
    path: "/checkout",
    name: "checkout",
    component: CheckoutPage,
    meta: { requiresAuth: true },
  },

  {
    path: "/orders/myorders",
    name: "myOrders",
    component: MyOrdersPage,
    meta: { requiresAuth: true },
  },

  {
    path: "/orders/:id", //
    name: "orderDetails",
    component: OrderDetailsPage,
    props: true,
    meta: { requiresAuth: true },
  },

  // admin routes
  {
    path: "/admin/dashboard", 
    name: "adminDashboard",
    component: AdminDashboardPage,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  {
    path: "/admin/users",
    name: "adminUserList",
    component: AdminUserListPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  //products
  {
    path: "/admin/products",
    name: "adminProductList",
    component: AdminProductListPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  {
    path: "/admin/products/new",
    name: "adminProductCreate",
    component: AdminProductFormPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  {
    path: "/admin/products/:id/edit",
    name: "adminProductEdit",
    component: AdminProductFormPage,
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  {
    path: "/admin/orders/:id", 
    name: "adminOrderDetails",
    component: AdminOrderDetailsPage, 
    props: true,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // //category
  {
    path: "/admin/categories",
    name: "adminCategoryList",
    component: AdminCategoryListPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  // //orders
  {
    path: "/admin/orders",
    name: "adminOrderList",
    component: AdminOrderListPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// router.beforeEach((to, from, next) => {
//   const isLoggedIn = store.getters["user/isLoggedIn"];
//   const userRole = store.getters["user/userRole"];

//   if (to.meta.requiresAuth && !isLoggedIn) {
//     next({ name: "login", query: { redirect: to.fullPath } });
//   } else if (to.meta.requiresAdmin && userRole !== "admin") {
//     alert("Not authorized! Access denied.");
//     next({ name: "home" });
//   } else {
//     next();
//   }
// });
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters["user/isLoggedIn"];
  const isAdmin = store.getters["user/isAdmin"]; // <-- Lấy getter isAdmin

  // Logic chuyển hướng cho Admin
  if (to.path === '/' && isLoggedIn && isAdmin) {
    // Nếu là admin và đang cố gắng truy cập trang chủ, chuyển hướng đến admin dashboard
    next({ name: 'adminDashboard' });
  } else if (to.meta.requiresAuth && !isLoggedIn) {
    // Nếu yêu cầu xác thực nhưng chưa đăng nhập
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (to.meta.requiresAdmin && !isAdmin) { // <-- Sửa điều kiện này
    // Nếu yêu cầu quyền admin nhưng không phải admin
    alert("Not authorized! Access denied.");
    next({ name: "home" });
  } else {
    // Cho phép truy cập
    next();
  }
});

export default router;
