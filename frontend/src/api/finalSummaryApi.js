import axios from "axios";

const API_URL = "https://korea-attendance-96b0a03da0c9.herokuapp.com/api/final-summary";

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

// 고정 점수 목록 불러오기
export const fetchFixedScoresApi = async (classId, semester) => {
  const response = await axios.get(`${API_URL}/fixed-scores`, {
    params: { classId, semester },
  });
  return response.data; // [{ studentId: '2024120090', fixedGrade: 'A+' }, ...]
};

// 고정 점수 저장 or 삭제 (빈 값이면 삭제 처리됨)
export const updateFixedScoreApi = async ({ studentId, classId, semester, fixedGrade }) => {
  const response = await axios.post(`${API_URL}/fixed-scores`, {
    studentId,
    classId,
    semester,
    fixedGrade, // 빈 문자열 '' 또는 null이면 삭제
  });
  return response.data; // 보통 { success: true } 같은 응답 (지금은 .ok().build()니까 빈값일 수도)
};
