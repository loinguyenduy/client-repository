// frontend/src/store.js

import { createStore } from "vuex";
// apiClient và router không cần thiết phải import ở đây nếu chúng chỉ được dùng trong các module con
// import apiClient from "./helpers/api"; 
// import router from "./router"; 

// Import các modules Vuex đã tách ra file riêng
import userModule from "./modules/userModule"; 
import cartModule from "./modules/cartModule";

const store = createStore({
  modules: {
    user: userModule,
    cart: cartModule, // ĐĂNG KÝ MODULE CART Ở ĐÂY
  },
});

export default store;
