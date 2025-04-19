import axios from "axios";
const API_URL = "https://korea-attendance-96b0a03da0c9.herokuapp.com/api/scores"; // 또는 배포된 주소

// ✅ 학생+성적 데이터 통합 조회
export const fetchGradeWithStudents = async (classId, semester) => {
  const response = await axios.get(`${API_URL}/grades`, {
    params: { classId, semester },
  });
  return response.data;
};
