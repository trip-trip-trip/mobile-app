// 오늘 날짜 YYYY-MM-DD — 디바이스 로컬 시간 기준
// (사진이 찍힌 날짜가 사용자의 실제 시간 감각과 일치해야 하므로 UTC가 아닌 로컬 기준 사용)
export const getTodayYmd = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// 오늘 날짜 YYYY-MM-DD — UTC 기준
export const getTodayUtcYmd = () => {
  return new Date().toISOString().split("T")[0];
};

// 디바이스의 IANA 타임존 식별자 (예: "Asia/Seoul") — 실패 시 UTC
export const getDeviceTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
};

// 디바이스의 UTC 오프셋 라벨 (예: "UTC+9", "UTC-4:30", "UTC±0")
export const getUtcOffsetLabel = (date: Date = new Date()) => {
  const offsetMin = -date.getTimezoneOffset();
  if (offsetMin === 0) return "UTC±0";

  const sign = offsetMin > 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;

  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
};

// 시계 표기용 "YYYY.MM.DD HH:mm:ss" — useUtc이면 UTC, 아니면 디바이스 로컬 기준
export const formatClockStamp = (date: Date, useUtc = false) => {
  const y = useUtc ? date.getUTCFullYear() : date.getFullYear();
  const mo = (useUtc ? date.getUTCMonth() : date.getMonth()) + 1;
  const d = useUtc ? date.getUTCDate() : date.getDate();
  const h = useUtc ? date.getUTCHours() : date.getHours();
  const mi = useUtc ? date.getUTCMinutes() : date.getMinutes();
  const s = useUtc ? date.getUTCSeconds() : date.getSeconds();

  const p = (n: number) => String(n).padStart(2, "0");
  return `${y}.${p(mo)}.${p(d)} ${p(h)}:${p(mi)}:${p(s)}`;
};

// 내일 날짜 년도, 달, 일
export const getNextDay = (dateStr: string) => {
  const [y, m, d] = dateStr.split("-").map(Number);

  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return { year, month, day };
};

// endDate가 today 이하이면 true (오늘 종료도 완료로 처리)
export const isCompletedTrip = (endDate: string, todayYmd: string) => {
  return endDate <= todayYmd;
};

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

export const parseYmdSafe = (input?: string | null) => {
  if (!input) return null;
  const ymd = input.includes("T") ? input.split("T")[0] : input;

  const parts = ymd.split("-");
  if (parts.length !== 3) return null;

  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);

  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d))
    return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;

  return { ymd, y, m, d };
};

export const formatEnglishDate = (input?: string | null) => {
  const parsed = parseYmdSafe(input);
  if (!parsed) return "";
  const { y, m, d } = parsed;
  return `${MONTHS[m - 1]} ${String(d).padStart(2, "0")}, ${y}`;
};

export const formatDateRangeToEnglish = (
  start?: string | null,
  end?: string | null
) => {
  const s = parseYmdSafe(start);
  const e = parseYmdSafe(end);
  if (!s || !e) return "";

  const startStr = formatEnglishDate(s.ymd);
  const endStr = formatEnglishDate(e.ymd);

  if (s.ymd === e.ymd) return startStr;
  return `${startStr} - ${endStr}`;
};
