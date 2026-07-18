// 이 파일은 "표시 포맷터"만 담는다.
// 날짜로 상태를 판정하는 함수(getTodayYmd, isCompletedTrip, getNextDay 등)는
// 롤 시스템 도입으로 제거됨 — 판정은 전부 서버가 담당한다 (travel-day-roll-spec.md 9장).

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
