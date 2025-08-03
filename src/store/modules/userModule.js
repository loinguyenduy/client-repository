import apiClient from "../../helpers/api";
import router from "../../router";

const userModule = {
  namespaced: true,
  state: () => ({
    userInfo: localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null,
    token: localStorage.getItem("token") || null, 
  }),

  getters: {
    isLoggedIn: (state) => !!state.token, 
    userToken: (state) => state.token, 
    userRole: (state) => (state.userInfo ? state.userInfo.role : null),
    getUserInfo: (state) => state.userInfo,
    isAdmin: (state) => state.userInfo && state.userInfo.role === "admin",
  },

  mutations: {
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo;
      if (userInfo) {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
      } else {
        localStorage.removeItem("userInfo");
      }
    },
    SET_AUTH_TOKEN(state, token) {
      state.token = token;
      if (token) {
        localStorage.setItem("token", token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem("token");
        delete apiClient.defaults.headers.common['Authorization'];
      }
    },

    CLEAR_USER_INFO(state) {
      state.userInfo = null;
      state.token = null; 
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token"); 
      delete apiClient.defaults.headers.common['Authorization']; 
    },
  },

  actions: {
    async login({ commit, dispatch }, { email, password }) { 
      try {
        const { data } = await apiClient.post("/users/login", {
          email,
          password,
        });
        commit("SET_USER_INFO", data); 
        commit("SET_AUTH_TOKEN", data.token); 
        dispatch("cart/fetchCart", null, { root: true });
        
        if (data.role === "admin") { 
          router.push("/admin/dashboard"); 
        } else {
          router.push("/"); 
        }
        return true;
      } catch (err) {
        console.error("Login failed: ", err);
        const message =
          err.response && err.response.data.message
            ? err.response.data.message
            : "Login failed!";
        throw new Error(message);
      }
    },


    async register(context, userData) { 
      try {
        const { data } = await apiClient.post("/users/register", userData);
        console.log("Registration successful:", data.message);
        return true; 
      } catch (err) {
        console.error("Registration failed:", err);
        const message =
          err.response && err.response.data.message
            ? err.response.data.message
            : "Register failed!";
        throw new Error(message);
      }
    },

    async logout({ commit }) {
      commit("CLEAR_USER_INFO");
      router.push("/login"); 
    },

    async fetchUserProfile({ commit, getters }) {
      if (!getters.isLoggedIn) return;

      try {
        const { data } = await apiClient.get("/users/profile");
        const currentInfo = getters.getUserInfo;
        commit("SET_USER_INFO", { ...currentInfo, ...data }); 
      } catch (err) {
        console.error("Failed to fetch user profile:", err);

        if (
          err.response &&
          err.response.status === 400 &&
          err.response.data.message === "Current password is incorrect."
        ) {
          throw err;
        }
        if (err.response && err.response.status === 401) {
          commit("CLEAR_USER_INFO");
          router.push("/login");
        }
        throw err;
      }
    },

    async updateProfile({ commit, state }, updatedData) {
      try {
        const { data } = await apiClient.put("/users/profile", updatedData);

        const currentInfo = state.userInfo;
        const updatedInfo = { ...currentInfo, ...data };
        commit("SET_USER_INFO", updatedInfo);

        return data;
      } catch (err) {
        console.error("Update profile failed:", err);
        const message =
          err.response && err.response.data.message
            ? err.response.data.message
            : "Update profile failed.";
        throw new Error(message);
      }
    },
  },
};

export default userModule;
