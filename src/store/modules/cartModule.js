
import apiClient from '../../helpers/api'; // 

const cartModule = {
  namespaced: true, 

  state: () => ({
    cartItems: [], 
    totalPrice: 0, 
    isLoading: false, 
    error: null,
  }),

  getters: {
    getCartItems: (state) => state.cartItems,
    getCartTotal: (state) => state.totalPrice,
    getCartItemCount: (state) =>
      state.cartItems.reduce((count, item) => count + item.quantity, 0),
    isCartLoading: (state) => state.isLoading,
    getCartError: (state) => state.error,
  },

  mutations: {
    SET_CART_ITEMS(state, { cartItems, totalPrice }) {
      state.cartItems = cartItems;
      state.totalPrice = totalPrice;
      state.error = null; 
    },
    ADD_ITEM_TO_LOCAL_CART(state, item) {
      const existingItemIndex = state.cartItems.findIndex(
        (cartItem) => String(cartItem.product._id) === String(item.product._id)
      );
      if (existingItemIndex > -1) {
        state.cartItems[existingItemIndex].quantity += item.quantity;
      } else {
        state.cartItems.push(item);
      }
      state.totalPrice = state.cartItems.reduce(
        (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
        0
      );
      state.error = null;
    },
    REMOVE_ITEM_FROM_LOCAL_CART(state, productId) {
      state.cartItems = state.cartItems.filter(
        (item) => String(item.product._id) !== String(productId)
      );
      state.totalPrice = state.cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      state.error = null;
    },
    UPDATE_ITEM_QUANTITY_LOCAL_CART(state, { productId, quantity }) {
      const item = state.cartItems.find(
        (cartItem) => String(cartItem.product._id) === String(productId)
      );
      if (item) {
        item.quantity = quantity;
        state.totalPrice = state.cartItems.reduce(
          (acc, cartItem) => acc + cartItem.price * cartItem.quantity,
          0
        );
      }
      state.error = null;
    },
    CLEAR_LOCAL_CART(state) {
      state.cartItems = [];
      state.totalPrice = 0;
      state.error = null;
    },
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
      state.isLoading = false;
    },
  },

  actions: {
    async fetchCart({ commit }) {
      commit("SET_LOADING", true);
      try {
        const response = await apiClient.get("/cart");
        commit("SET_CART_ITEMS", {
          cartItems: response.data.cartItem,
          totalPrice: response.data.totalPrice,
        });
      } catch (err) {
        console.error("Error fetching cart:", err);
        commit(
          "SET_ERROR",
          err.response?.data?.message || "Failed to fetch cart."
        );
        commit("SET_CART_ITEMS", { cartItems: [], totalPrice: 0 }); 
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async addToCart({ commit, dispatch }, { productId, quantity }) {
      commit("SET_LOADING", true);
      try {
        const response = await apiClient.post("/cart/add", {
          productId,
          quantity,
        });
        commit("SET_CART_ITEMS", {
          cartItems: response.data.cartItem,
          totalPrice: response.data.totalPrice,
        });
        dispatch('fetchCart');
        return true; 
      } catch (err) {
        console.error("Error adding to cart:", err);
        commit(
          "SET_ERROR",
          err.response?.data?.message || "Failed to add product to cart."
        );
        throw err; 
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async removeFromCart({ commit, dispatch }, productId) {
      commit("SET_LOADING", true);
      try {
        await apiClient.delete(`/cart/remove/${productId}`);
        dispatch("fetchCart");
        return true;
      } catch (err) {
        console.error("Error removing from cart:", err);
        commit(
          "SET_ERROR",
          err.response?.data?.message || "Failed to remove product from cart."
        );
        throw err;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateCartQuantity({ commit, dispatch }, { productId, quantity }) {
      commit("SET_LOADING", true);
      try {
        const response = await apiClient.put(`/cart/update/${productId}`, {
          quantity,
        });
        commit("SET_CART_ITEMS", {
          cartItems: response.data.cartItem,
          totalPrice: response.data.totalPrice,
        });
        dispatch('fetchCart'); 
        return true;
      } catch (err) {
        console.error("Error updating cart quantity:", err);
        commit(
          "SET_ERROR",
          err.response?.data?.message || "Failed to update cart quantity."
        );
        throw err;
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async clearCart({ commit }) {
      commit("SET_LOADING", true);
      try {
        await apiClient.delete("/cart/clear");
        commit("CLEAR_LOCAL_CART"); 
        return true;
      } catch (err) {
        console.error("Error clearing cart:", err);
        commit(
          "SET_ERROR",
          err.response?.data?.message || "Failed to clear cart."
        );
        throw err;
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};

export default cartModule;
