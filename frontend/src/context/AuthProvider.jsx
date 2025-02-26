import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { AuthContext } from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loginStudent = async (userId) => {
    try {
      const response = await axios.get(`https://korea-attendance-96b0a03da0c9.herokuapp.com/api/auth/${userId}`);
      const userData = response.data;
      setUser(userData);
      sessionStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("📌 학생 로그인 실패:", error.response?.data || error.message);
      alert("등록된 학번이 없습니다. 관리자에게 문의하세요.");
    }
  };
  
  const loginProfessor = async (userId, password) => {
    try {
      console.log("📌 교수자 로그인 요청 보냄:", { userId, password });
      const response = await axios.post("https://korea-attendance-96b0a03da0c9.herokuapp.com/api/auth/professor-login", {
        userId,
        password,
      });
  
      const userData = response.data;
      setUser(userData);
      sessionStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("📌 교수자 로그인 실패:", error.response?.data || error.message);
      alert("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
    }
  };
  
  // ✅ 로그인 함수를 학생과 교수자용으로 완전히 분리
  const login = (userId) => {
    loginStudent(userId); // ✅ 학생 로그인만 수행
  };
  
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };
  
  return (
    <AuthContext.Provider value={{ user, login, loginProfessor, logout }}>
      {children}
    </AuthContext.Provider>
  );
  
};

export default AuthProvider;

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
