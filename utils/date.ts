export const getTodayYmd = () => {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
};

// endDate가 today보다 이전이면 "완료"
export const isCompletedTrip = (endDate: string, todayYmd: string) => {
  return endDate < todayYmd;
};

// YYYY-MM-DD을 FEB 12, 2026 같은 식으로 변환
export const formatDateRangeToEnglish = (start: string, end: string) => {
  const parseLocalDate = (ymd: string) => {
    const [y, m, d] = ymd.split("-");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const formatFull = (date: Date) =>
    date
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();

  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);

  if (start === end) {
    return formatFull(startDate);
  }

  return `${formatFull(startDate)} - ${formatFull(endDate)}`;
};
