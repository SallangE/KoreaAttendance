import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css"; // ✅ CSS 추가

const Header = () => {
  const { user, login, logout } = useAuth();
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (userId) {
      login(userId);
    } else {
      alert("아이디를 입력하세요.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header>
      {user ? (
        <div>
          <span>환영합니다, {user.userId}님! ({user.role})</span>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button onClick={handleLogin}>로그인</button>
        </div>
      )}
    </header>
  );
};

export default Header;
