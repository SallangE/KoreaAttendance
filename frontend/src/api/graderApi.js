// graderApi.js
import axios from "axios";

const API_BASE_URL = "https://korea-attendance-96b0a03da0c9.herokuapp.com/api/graders";

// ✅ 학기에 해당하는 채점자 전체 조회
export const fetchGradersBySemester = async (semester) => {
  const response = await axios.get(`${API_BASE_URL}?semester=${semester}`);
  return response.data;
};

// ✅ 채점자 추가 → "/add" 경로로 수정
export const addGrader = async ({ semester, graderName, color }) => {
  const response = await axios.post(`${API_BASE_URL}/add`, {
    semester,
    graderName,
    color,
  });
  return response.data;
};

// ✅ 채점자 수정 → "PUT /api/graders"로 수정 (path variable 제거)
export const updateGrader = async ({ graderId, graderName, color }) => {
  const response = await axios.put(`${API_BASE_URL}`, {
    graderId,
    graderName,
    color,
  });
  return response.data;
};

// ✅ 채점자 삭제 → 이건 그대로 유지
export const deleteGrader = async (graderId) => {
  const response = await axios.delete(`${API_BASE_URL}/${graderId}`);
  return response.data;
};
