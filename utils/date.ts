export const getTodayYmd = () => {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
};

// endDate가 today보다 이전이면 true
export const isCompletedTrip = (endDate: string, todayYmd: string) => {
  return endDate < todayYmd;
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
