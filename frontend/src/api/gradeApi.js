// src/api/gradeApi.js
import axios from "axios";

const API_URL = "https://korea-attendance-96b0a03da0c9.herokuapp.com/api/scores";

// ✅ 단일 학생의 중간고사 점수 업데이트
export const updateMidtermScore = async ({ studentId, classId, semester, score, penaltyReason, graderName }) => {
  return await axios.post(`${API_URL}/midterm`, {
    studentId,
    classId,
    semester,
    score,
    penaltyReason,
    graderName
  });
};

// ✅ 다중 학생에 채점자명 일괄 적용
export const updateGraderName = async ({ studentIds, classId, semester, graderName }) => {
    const requestBody = studentIds.map((studentId) => ({
      studentId,
      classId,
      semester,
      graderName,
    }));
  
    return await axios.post(`${API_URL}/grader`, requestBody);
  };
  
  export const updateMultipleMidtermScores = async (scoreList) => {
    return await axios.post(`${API_URL}/midterm/bulk`, scoreList);
  };
  