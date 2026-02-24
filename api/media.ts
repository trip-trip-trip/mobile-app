import axiosInstance from "./axios";
export const uploadMedia = async (
  mode: "photo" | "video",
  tripId: number,
  uri: string,
  comment: string
) => {
  const formData = new FormData();

  // 1. 파일 이름 및 확장자 추출
  const filename = uri.split("/").pop() || (mode === "photo" ? "photo.jpg" : "video.mov");
  const match = /\.(\w+)$/.exec(filename);
  const ext = match ? match[1] : (mode === "photo" ? "jpg" : "mov");

  // 2. 미디어 파일 추가
  formData.append("file", {
    uri,
    name: filename,
    type: mode === "photo" ? `image/${ext === "jpg" ? "jpeg" : ext}` : `video/quicktime`,
  } as any);

  // 3. 메타데이터 객체 생성
  const metaData = {
    tripId: tripId,
    captureType: mode.toUpperCase(),
    comment: comment,
    lat: 100, // 테스트용 하드코딩 (필요시 실제 좌표로 변경)
    lng: 200,
  };

  // 4. [핵심] 415 에러 방지 - meta를 JSON 파트로 명시해서 추가
  // 리액트 네이티브 FormData에서는 아래와 같은 객체 형태로 보내야 서버가 JSON 파트로 인식함
  formData.append("meta", {
    string: JSON.stringify(metaData),
    type: "application/json",
  } as any);

  // 5. 엔드포인트 결정
  const endpoint = mode === "photo" ? "/media/upload" : "/media/upload/reelItem";

  try {
    const response = await axiosInstance.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // 필요하다면 transformRequest 설정을 건드리지 않도록 주의
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};