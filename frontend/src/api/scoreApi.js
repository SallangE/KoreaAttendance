import axios from "axios";
const API_URL = "https://korea-attendance-96b0a03da0c9.herokuapp.com/api/scores"; // 또는 배포된 주소

// ✅ 학생+성적 데이터 통합 조회
export const fetchGradeWithStudents = async (classId, semester) => {
  const response = await axios.get(`${API_URL}/grades`, {
    params: { classId, semester },
  });
  return response.data;
};

// 기말고사 성적 조회
export const fetchFinalGradeWithStudents = async (classId, semester) => {
  const response = await axios.get(`${API_URL}/final`, {
    params: { classId, semester },
  });
  return response.data;
};

// 기말고사 성적 단건 저장
export const updateFinalScore = async (data) => {
  const response = await axios.post(`${API_URL}/final`, data);
  return response.data;
};

// 기말고사 성적 일괄 저장
export const updateMultipleFinalScores = async (dataList) => {
  const response = await axios.post(`${API_URL}/final/bulk`, dataList);
  return response.data;
};

export const updateFinalGraderName = async ({ studentIds, classId, semester, graderName }) => {
  const requestBody = studentIds.map((studentId) => ({
    studentId,
    classId,
    semester,
    graderName,
  }));

  return await axios.post(`${API_URL}/final/grader`, requestBody);
};