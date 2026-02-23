import axiosInstance from "./axios";
import { getSecureStore } from "@/utils/secureStore";

export async function createInvite(tripId: number): Promise<{ inviteCode: string }> {
  const accessToken = await getSecureStore("accessToken");
  if (!accessToken) throw new Error("로그인이 필요합니다.");

  const { data } = await axiosInstance.post(
    `/trips/${tripId}/invitations`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const inviteCode = data?.inviteCode ?? data?.result?.inviteCode;
  if (!inviteCode) throw new Error("초대 코드 생성에 실패했습니다.");

  return { inviteCode };
}

// result를 반환하도록 수정
export async function getInviteInfo(inviteCode: string) {
  const { data } = await axiosInstance.get(`/invitations/${inviteCode}`);
  return data.result; 
}

export async function acceptInvite(inviteCode: string) {
  const accessToken = await getSecureStore("accessToken");
  const { data } = await axiosInstance.post(
    `/invitations/${inviteCode}/accept`,
    {},
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return data;
}