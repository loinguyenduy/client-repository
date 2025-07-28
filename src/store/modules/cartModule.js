// frontend/src/store/modules/cart.js

import apiClient from '../../helpers/api'; // <-- SỬA ĐƯỜNG DẪN NÀY: Sử dụng alias @

const cartModule = {
  namespaced: true, // Quan trọng: Đảm bảo module này có namespace 'cart'

  state: () => ({
    cartItems: [], // Mảng chứa các sản phẩm trong giỏ hàng
    totalPrice: 0, // Tổng giá trị giỏ hàng
    isLoading: false, // Trạng thái loading cho các thao tác giỏ hàng
    error: null, // Lưu trữ lỗi nếu có
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
      state.error = null; // Xóa lỗi khi cập nhật thành công
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
      state.isLoading = false; // Dừng loading khi có lỗi
    },
  },

  actions: {
    // Action để lấy giỏ hàng của người dùng từ backend
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
        commit("SET_CART_ITEMS", { cartItems: [], totalPrice: 0 }); // Đảm bảo giỏ hàng rỗng nếu có lỗi
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Action để thêm sản phẩm vào giỏ hàng
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
        // Sau khi thêm thành công, fetch lại giỏ hàng để đảm bảo đồng bộ
        dispatch('fetchCart'); // <-- BỎ COMMENT DÒNG NÀY
        return true; // Trả về true để biết thao tác thành công
      } catch (err) {
        console.error("Error adding to cart:", err);
        commit(
          "SET_ERROR",
          err.response?.data?.message || "Failed to add product to cart."
        );
        throw err; // Ném lỗi để component có thể bắt và hiển thị
      } finally {
        commit("SET_LOADING", false);
      }
    },

    // Action để xóa sản phẩm khỏi giỏ hàng
    async removeFromCart({ commit, dispatch }, productId) {
      commit("SET_LOADING", true);
      try {
        await apiClient.delete(`/cart/remove/${productId}`);
        // Sau khi xóa thành công, fetch lại giỏ hàng để cập nhật state
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

    // Action để cập nhật số lượng sản phẩm trong giỏ hàng
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
        dispatch('fetchCart'); // <-- BỎ COMMENT DÒNG NÀY
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

    // Action để xóa toàn bộ giỏ hàng
    async clearCart({ commit }) {
      commit("SET_LOADING", true);
      try {
        await apiClient.delete("/cart/clear");
        commit("CLEAR_LOCAL_CART"); // Xóa giỏ hàng cục bộ
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
