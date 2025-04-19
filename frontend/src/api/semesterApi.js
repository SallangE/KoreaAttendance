// src/api/semesterApi.js
import axios from "axios"; // 또는 axios 기본 인스턴스
const API_BASE_URL = "https://korea-attendance-96b0a03da0c9.herokuapp.com/api/semesters";

// 학기 목록 가져오기
export const fetchSemestersByClassId = async (classId) => {
  const response = await axios.get(`${API_BASE_URL}/${classId}`);
  return response.data;
};

// 학기 추가 요청
export const createSemester = async ({ classId, semester }) => {
    return await axios.post(`${API_BASE_URL}`, { classId, semester });
  };
