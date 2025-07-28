import apiClient from "../../helpers/api";
import router from "../../router";

const userModule = {
  namespaced: true,
  state: () => ({
    userInfo: localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null,
    // THAY ĐỔI: Thêm trường 'token' vào state để quản lý token một cách rõ ràng.
    // Trước đây, token được lưu trong userInfo, giờ tách ra để quản lý độc lập.
    token: localStorage.getItem("token") || null, 
  }),

  getters: {
    // THAY ĐỔI: Kiểm tra isLoggedIn dựa trên sự tồn tại của 'token' trong state.
    isLoggedIn: (state) => !!state.token, 
    // THAY ĐỔI: Lấy token từ 'state.token'.
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
    // THAY ĐỔI: Thêm mutation mới để thiết lập token.
    // Mutation này sẽ lưu token vào state và localStorage, đồng thời cập nhật Authorization header cho apiClient.
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
    // THAY ĐỔI: Cập nhật mutation CLEAR_USER_INFO để xóa cả userInfo và token.
    // Đảm bảo dữ liệu xác thực được xóa sạch khỏi state và localStorage khi đăng xuất.
    CLEAR_USER_INFO(state) {
      state.userInfo = null;
      state.token = null; 
      localStorage.removeItem("userInfo");
      localStorage.removeItem("token"); 
      delete apiClient.defaults.headers.common['Authorization']; 
    },
  },

  actions: {
    // THAY ĐỔI: Bỏ 'getters' khỏi destructuring vì chúng ta sẽ kiểm tra role trực tiếp từ 'data'.
    async login({ commit, dispatch }, { email, password }) { 
      try {
        const { data } = await apiClient.post("/users/login", {
          email,
          password,
        });

        // THAY ĐỔI LỚN:
        // 'data' từ API chính là đối tượng userInfo hoàn chỉnh.
        commit("SET_USER_INFO", data); // Gán trực tiếp 'data' vào userInfo
        commit("SET_AUTH_TOKEN", data.token); // Token vẫn nằm trong data.token

        // Dispatch action từ module khác, cần root: true
        dispatch("cart/fetchCart", null, { root: true });
        
        // THAY ĐỔI LỚN: Chuyển hướng người dùng dựa trên vai trò TRỰC TIẾP từ 'data.role'.
        // Điều này đảm bảo vai trò được kiểm tra ngay lập tức và chính xác.
        if (data.role === "admin") { // Kiểm tra trực tiếp data.role
          router.push("/admin/dashboard"); // Chuyển hướng đến trang admin nếu là admin
        } else {
          router.push("/"); // Chuyển hướng đến trang chủ cho người dùng thường
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

    // THAY ĐỔI: Loại bỏ tham số destructuring rỗng ({}) để tránh lỗi ESLint 'no-empty-pattern'.
    // Action này chỉ có nhiệm vụ gọi API đăng ký và không tự động đăng nhập người dùng.
    async register(context, userData) { 
      try {
        const { data } = await apiClient.post("/users/register", userData);
        console.log("Registration successful:", data.message);
        // KHÔNG commit "SET_USER_INFO" hoặc "SET_AUTH_TOKEN" ở đây.
        // KHÔNG dispatch "cart/fetchCart".
        // KHÔNG router.push("/").
        // Frontend (RegisterPage.vue) sẽ chịu trách nhiệm chuyển hướng đến trang login sau khi nhận được thành công.
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
        // Đảm bảo chỉ cập nhật userInfo, không thay đổi token (token được quản lý riêng)
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
