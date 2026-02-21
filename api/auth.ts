import { getSecureStore } from "@/utils/secureStore";
import axios from "axios";
import axiosInstance from "./axios";

type RequestUser = {
  // 뭔가 들어가야돼
};

async function postSignup(body: RequestUser) {
  const { data } = await axiosInstance.post(`/auth/signup`, body);
  return data;
}

async function postLogin(body: RequestUser): Promise<{ accessToken: string }> {
  const { data } = await axiosInstance.post(`/auth/google`, body);
  return data;
}

async function getMe() {
  const accessToken = await getSecureStore("accessToken");
  const { data } = await axiosInstance.get(`/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return data;
}
export { postSignup, postLogin, getMe };
