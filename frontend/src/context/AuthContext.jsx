import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

// ✅ AuthContext 생성
export const AuthContext = createContext(null);

// ✅ AuthProvider 유지!
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (userId) => {
    try {
      // ✅ 서버에서 역할(role) 가져오기
      const response = await fetch(`https://korea-attendance-96b0a03da0c9.herokuapp.com/api/auth/${userId}`);
      if (!response.ok) throw new Error("로그인 실패");

      const userData = await response.json();
      setUser(userData);
      sessionStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      alert("등록된 학번이 없습니다. 관리자에게 문의하세요.(2024010085@korea.ac.kr)");
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// ✅ useAuth 훅 제공
export const useAuth = () => useContext(AuthContext);
