import axios from "axios";

const API_URL = "https://korea-attendance-96b0a03da0c9.herokuapp.com/api/attendance";

// ✅ 수정 최종본
export const fetchAttendanceByDate = async (classId, date) => {
  console.log("📌 [API] fetchAttendanceByDate 받은 date:", date);
  const response = await axios.get(`${API_URL}/class/${classId}/date/${date}`);
  return response.data;
};


export const updateAttendanceState = (attendanceId, state) =>
  axios.put(`${API_URL}/${attendanceId}/state`, { state });

export const updateAttendanceReason = (attendanceId, reason) =>
  axios.put(`${API_URL}/${attendanceId}/reason`, { reason });

export const deleteAttendance = (attendanceId) =>
  axios.delete(`${API_URL}/${attendanceId}`);

// ✅ 학생 출석 체크 (Check-in)
export const studentCheckIn = (studentId, classId) => {
  return axios.post(`${API_URL}/check-in`, {
    studentId: String(studentId),  // 반드시 문자열로 변환
    classId: Number(classId),      // 숫자로 변환
  });
};
export const addAttendance = (studentId, classId, date, state) =>
  axios.post(`${API_URL}/add`, { studentId, classId, date, state });

