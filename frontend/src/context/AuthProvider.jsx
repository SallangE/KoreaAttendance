import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import PasswordModal from "../components/PasswordModal"; // ✅ 비밀번호 모달 추가

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pendingProfessor, setPendingProfessor] = useState(null); // 교수자 로그인 대기 상태
  const [showPasswordModal, setShowPasswordModal] = useState(false); // 모달 표시 여부

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (userId, password) => {
    try {
      const response = await axios.post("https://korea-attendance-96b0a03da0c9.herokuapp.com/api/auth/login", {
        userId,
        password,
      });

      const userData = response.data;
      console.log("📌 로그인 응답 데이터:", userData); // ✅ 서버 응답 확인용

      if (userData.role === "professor") {
        // ✅ 교수자 로그인 시 비밀번호 추가 입력 요구
        console.log("📌 교수자 로그인 감지! 비밀번호 모달을 띄웁니다.");
        setPendingProfessor(userData);
        setShowPasswordModal(true);
      } else {
        // ✅ 일반 로그인 진행
        setUser(userData);
        sessionStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("📌 로그인 실패:", error.response?.data || error.message);
      alert("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
    }
  };

  // ✅ 교수자 비밀번호 확인 후 로그인 완료
  const confirmProfessorLogin = async (password) => {
    if (!pendingProfessor) return;

    try {
      const response = await axios.post("https://korea-attendance-96b0a03da0c9.herokuapp.com/api/auth/professor-login", {
        userId: pendingProfessor.userId,
        password,
      });

      if (response.status !== 200) {
        throw new Error("비밀번호가 일치하지 않습니다.");
      }

      setUser(pendingProfessor);
      sessionStorage.setItem("user", JSON.stringify(pendingProfessor));
      setPendingProfessor(null);
      setShowPasswordModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
      {/* ✅ 교수자 로그인 시 비밀번호 입력 모달 추가 */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={confirmProfessorLogin}
      />
    </AuthContext.Provider>
  );
};

// ✅ default export 추가
export default AuthProvider;

// ✅ PropTypes 검증
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
