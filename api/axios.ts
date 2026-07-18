import axios from "axios";

import { getDeviceTimeZone } from "@/utils/date";

const BASE_URL = "https://backend-v2-production-789a.up.railway.app";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// 클라이언트는 시각이 아니라 IANA 시간대 ID만 보고한다 (travel-day-roll-spec.md).
// 서버가 이 헤더로 롤 경계를 계산하므로 모든 요청에 첨부한다.
axiosInstance.interceptors.request.use((config) => {
  config.headers["X-Timezone"] = getDeviceTimeZone();
  return config;
});

export default axiosInstance;
