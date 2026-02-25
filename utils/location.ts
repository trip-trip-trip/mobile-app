// /**
//  * unknown → number | null 안전 변환
//  */
// const toNumberSafe = (input: unknown): number | null => {
//   if (typeof input === "number" && Number.isFinite(input)) return input;
//   if (typeof input === "string") {
//     const n = Number(input.trim());
//     return Number.isFinite(n) ? n : null;
//   }
//   return null;
// };

// const toDms = (value: number) => {
//   const abs = Math.abs(value);

//   const deg = Math.floor(abs);
//   const minFloat = (abs - deg) * 60;
//   const min = Math.floor(minFloat);
//   const sec = (minFloat - min) * 60;

//   return { deg, min, sec };
// };

// /**
//  * 위경도 → DMS 문자열
//  * ex) 37°33'59.40"N 126°58'40.80"E
//  */
// export const formatCoordLabelDms = (
//   latInput: unknown,
//   lngInput: unknown
// ): string => {
//   const lat = toNumberSafe(latInput);
//   const lng = toNumberSafe(lngInput);

//   if (lat == null || lng == null) return "-";
//   if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return "-";

//   const latDms = toDms(lat);
//   const lngDms = toDms(lng);

//   const latHem = lat >= 0 ? "N" : "S";
//   const lngHem = lng >= 0 ? "E" : "W";

//   return `${latDms.deg}°${latDms.min}'${latDms.sec.toFixed(2)}"${latHem} ${
//     lngDms.deg
//   }°${lngDms.min}'${lngDms.sec.toFixed(2)}"${lngHem}`;
// };

// utils/coord.ts

const toNumberSafe = (input: unknown): number | null => {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string") {
    const n = Number(input.trim());
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const toDms = (value: number) => {
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = (minFloat - min) * 60;
  return { deg, min, sec };
};

export const formatCoordLabelDms = (latInput: unknown, lngInput: unknown) => {
  const lat = toNumberSafe(latInput);
  const lng = toNumberSafe(lngInput);

  if (lat == null || lng == null) return "-";

  const latDms = toDms(lat);
  const lngDms = toDms(lng);

  const latHem = lat >= 0 ? "N" : "S";
  const lngHem = lng >= 0 ? "E" : "W";

  return `${latDms.deg}°${latDms.min}'${latDms.sec.toFixed(2)}"${latHem} ${
    lngDms.deg
  }°${lngDms.min}'${lngDms.sec.toFixed(2)}"${lngHem}`;
};
