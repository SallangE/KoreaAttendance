import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/PasswordModal.css"; // ✅ 모달 스타일 추가

const PasswordModal = ({ isOpen, onClose }) => {
  const { loginProfessor } = useAuth(); // ✅ 교수자 로그인 함수 가져오기
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!userId || !password) {
      alert("아이디와 비밀번호를 입력하세요.");
      return;
    }

    setLoading(true);
    console.log("📌 교수자 로그인 시도:", { userId, password });

    try {
      await loginProfessor(userId, password);
      console.log("✅ 교수자 로그인 성공!");
      setUserId(""); // ✅ 입력값 초기화
      setPassword("");
      onClose(); // ✅ 로그인 성공 시 모달 닫기
    } catch (error) {
      console.error("❌ 교수자 로그인 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null; // ✅ 모달이 닫혀 있으면 렌더링하지 않음

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
              disabled={loading} // ✅ 로그인 중 입력 비활성화
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="modal-buttons">
            <button type="submit" disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
            <button type="button" onClick={onClose} disabled={loading}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordModal;
