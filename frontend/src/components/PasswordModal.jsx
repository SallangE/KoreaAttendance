import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/PasswordModal.css"; // ✅ 모달 스타일 추가

const PasswordModal = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!userId || !password) {
      alert("아이디와 비밀번호를 입력하세요.");
      return;
    }

    await login(userId, password);
    onClose(); // ✅ 로그인 성공 후 모달 닫기
  };

  if (!isOpen) return null; // ✅ 모달이 닫혀 있으면 렌더링하지 않음

  return (
    <div className="modal-overlay">
    <div className="modal-content">
        <div className="modal-title">교수자 로그인</div> {/* ✅ 제목을 박스 안에 넣음 */}
        <form onSubmit={handleLogin}>
        <div className="modal-inputs"> {/* ✅ 인풋을 감싸는 컨테이너 */}
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
        <div className="modal-buttons"> {/* ✅ 버튼을 가로 정렬 */}
            <button type="submit">로그인</button>
            <button type="button" onClick={onClose}>취소</button>
        </div>
        </form>
    </div>
    </div>
  );
};

export default PasswordModal;
