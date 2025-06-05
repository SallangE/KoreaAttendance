import axios from "axios";

const API_URL = "http://localhost:8080/api/final-summary";

// ✅ 초기 렌더링용 API (출석 점수 제외)
export const fetchFinalSummaryBasic = async (classId) => {
  const response = await axios.get(`${API_URL}/basic`, {
    params: { classId },
  });
  return response.data;
};

// ✅ 출석 점수 반영용 API
export const fetchFinalSummary = async ({ classId, startDate, endDate, days, semester }) => {
  const formattedStartDate =
    startDate instanceof Date ? startDate.toISOString().split("T")[0] : startDate;
  const formattedEndDate =
    endDate instanceof Date ? endDate.toISOString().split("T")[0] : endDate;

  const params = new URLSearchParams({
    classId,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    semester,
  });

  if (Array.isArray(days)) {
    days.forEach((d) => params.append("days", d));
  } else if (typeof days === "string") {
    days.split(",").forEach((d) => params.append("days", d.trim()));
  }

  const response = await axios.get(`${API_URL}?${params.toString()}`);
  return response.data;
};
