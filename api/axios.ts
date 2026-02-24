import axios from "axios";

const BASE_URL = "https://backend-v2-production-789a.up.railway.app";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

console.log(
  "🔑 ACCESS TOKEN (axios header):",
  axiosInstance.defaults.headers.common.Authorization
);

export default axiosInstance;
