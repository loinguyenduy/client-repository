import axios from "axios";
import store from "../store/store.js";

const apiClient = axios.create({
  baseURL: "https://vietflavor.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = store.getters["user/userToken"];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (err) => {
    if (err.response && err.response.status === 401) {
      console.warn("Unauthorized request.");
      store.dispatch("user/logout");
    }
    return Promise.reject(err);
  }
);

export default apiClient;
