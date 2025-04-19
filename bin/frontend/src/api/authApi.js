import axios from "axios";

export const login = async (userId) => {
  try {
    const response = await axios.post("https://korea-attendance-96b0a03da0c9.herokuapp.com/api/auth/login", null, {
      params: { userId },
    });

    return response.data; // { userId, name, role }
  } catch (error) {
    console.error("로그인 실패:", error.response?.data || error.message);
    throw error;
  }
};
