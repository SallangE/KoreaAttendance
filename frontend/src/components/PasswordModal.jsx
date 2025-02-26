import { useState } from "react";
import PropTypes from "prop-types";
import "../styles/PasswordModal.css"; // 스타일 추가

const PasswordModal = ({ isOpen, onClose, onConfirm }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password); // 입력한 비밀번호 전달
  };

  if (!isOpen) return null; // 모달이 열려있을 때만 렌더링

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>비밀번호 입력</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="modal-actions">
            <button type="submit">확인</button>
            <button type="button" onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

PasswordModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default PasswordModal;
