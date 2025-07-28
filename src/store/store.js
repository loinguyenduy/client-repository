// frontend/src/store.js

import { createStore } from "vuex";

import userModule from "./modules/userModule"; 
import cartModule from "./modules/cartModule";

const store = createStore({
  modules: {
    user: userModule,
    cart: cartModule, 
  },
});

export default store;
