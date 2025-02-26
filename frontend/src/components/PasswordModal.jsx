import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/PasswordModal.css"; // ✅ 모달 스타일 추가

const PasswordModal = ({ isOpen, onClose }) => {
  const { loginProfessor } = useAuth(); // ✅ login이 아니라 loginProfessor 사용
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      alert("아이디와 비밀번호를 입력하세요.");
      return;
    }

    console.log("📌 교수자 로그인 시도:", { userId, password });

    try {
      await loginProfessor(userId, password); // ✅ 교수자 로그인 API 호출
      console.log("✅ 교수자 로그인 성공!");
      onClose(); // ✅ 로그인 성공 후 모달 닫기
    } catch (error) {
      console.error("❌ 교수자 로그인 실패:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-title">교수자 로그인</div>
        <form onSubmit={handleLogin}>
          <div className="modal-inputs">
            <input
              type="text"
              placeholder="교수자 아이디"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="modal-buttons">
            <button type="submit">로그인</button>
            <button type="button" onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
