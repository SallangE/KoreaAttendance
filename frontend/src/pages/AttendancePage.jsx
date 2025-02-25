import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { studentCheckIn } from "../api/attendanceApi";
import { useAuth } from "../context/AuthContext";

const AttendancePage = () => {
  const { classId } = useParams();
  const { user } = useAuth(); // 로그인된 사용자 정보 가져오기
  const [message, setMessage] = useState("");
  const [state, setState] = useState(""); // 출결 상태 저장

  const handleCheckIn = async () => {
    if (!user || user.role !== "student") {
      setMessage("❌ 학생만 출석할 수 있습니다.");
      return;
    }
  
    if (!classId || isNaN(Number(classId))) {
      setMessage("⚠️ 올바른 강의실 정보가 없습니다.");
      return;
    }
  
    const date = new Date().toISOString().split("T")[0]; // 오늘 날짜
    const studentId = user.userId; // 로그인된 학생 ID
  
    try {
      const response = await studentCheckIn(studentId, Number(classId), date);
  
      console.log("✅ API 응답 데이터:", response.data); // ✅ 응답 확인
  
      if (response.data) {
        const { message, state } = response.data; // ✅ 메시지와 상태 가져오기
        setState(state);
        setMessage(`${message} 📌 출석 상태: `);
      } else {
        setMessage("✅ 출석이 정상적으로 처리되었습니다.");
      }
    } catch (error) {
      console.error("출석 요청 실패:", error);
  
      if (error.response && typeof error.response.data === "object") {
        const { message, state } = error.response.data;
        setState(state);
        setMessage(`${message} 📌 출석 상태: `);
      } else {
        setMessage(error.response?.data || "⚠️ 서버와 통신 중 오류가 발생했습니다.");
      }
    }
  };
  
  // ✅ 출석 상태를 한글로 변환하는 함수
const getStateLabel = () => {
  switch (state) {
    case "present": return "출석";  // ✅ present → 출석
    case "late": return "지각";     // ✅ late → 지각
    case "absent": return "결석";   // ✅ absent → 결석
    default: return "미등록";       // ✅ 기본값
  }
};


  // ✅ 출석 상태에 따른 글자 색상 지정
  const getStateColor = () => {
    switch (state) {
      case "present": return "blue";   // 출석 (파랑)
      case "late": return "black";     // 지각 (검정)
      case "absent": return "red";     // 결석 (빨강)
      default: return "gray";          // 기본 색상 (회색)
    }
  };

  return (
    <div className="classroom-container"> {/* ✅ 메인 컨테이너 적용 */}
      <h2 className="classroom-title">출석 하기</h2> {/* ✅ 제목 스타일 적용 */}
  
      <div className="button-group"> {/* ✅ 버튼 그룹 스타일 적용 */}
        <button onClick={handleCheckIn}>출석 등록</button>
      </div>
  
            {message && (
        <p className="attendance-message">
          {message}
          <span style={{ color: getStateColor(), fontWeight: "bold" }}>{getStateLabel()}</span>
        </p>
      )}
      
      <Link to="/">
        <button className="button-cancel">메인으로 돌아가기</button>
      </Link>
    </div>
  );
};

export default AttendancePage;
