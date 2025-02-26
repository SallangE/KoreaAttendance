import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Header.css"; // ✅ CSS 추가
import koreaLogo from "../assets/koreaLogo.png"; // ✅ 고려대학교 로고 이미지 가져오기

const Header = () => {
  const { user, login, logout } = useAuth();
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault(); // ✅ 기본 동작(새로고침) 방지
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
      {/* ✅ 왼쪽: 로그인 폼 또는 유저 정보 */}
      {user ? (
        <div>
          <span>환영합니다, {user.userId}님! ({user.role})</span>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}> {/* ✅ form 태그 사용 (엔터 가능) */}
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button type="submit">로그인</button> {/* ✅ type="submit" 추가 */}
        </form>
      )}

      {/* ✅ 오른쪽: 고려대학교 로고 */}
      <img src={koreaLogo} alt="고려대학교 로고" className="logo" />
    </header>
  );
};

export default Header;
