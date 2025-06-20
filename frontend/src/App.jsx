import { BrowserRouter as Router, Routes, Route, useLocation  } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";  // ✅ import 확인!
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClassroomList from "./components/ClassroomList";
import ClassroomDetail from "./pages/ClassroomDetail";
import AttendancePage from "./pages/AttendancePage";
import ManageAttendancePage from "./pages/ManageAttendancePage";
import ClassSettings from "./pages/ClassSettings"; 

import SortgsPage from "./pages/SortgsPage";

import ScoreManagement from "./pages/ScoreManagement";

function TitleUpdater() {
  const location = useLocation(); // 현재 경로 감지

  useEffect(() => {
    switch (location.pathname) {
      case "/":
        document.title = "[고려대학교] 출결관리 시스템";
        break;
      case "/classroom/:classId":
        document.title = "[고려대학교] 강의실 상세보기";
        break;
      case "/classroom/:classId/attendance":
        document.title = "[고려대학교] 출석하기";
        break;
      case "/classroom/:classId/manage-attendance":
        document.title = "[고려대학교] 출결 관리 페이지";
        break;
      case "/classroom/:classId/settings":
        document.title = "[고려대학교] 강의실 설정";
        break;
      default:
        document.title = "[고려대학교] 출결관리 시스템";
    }
  }, [location]); // location 변경될 때마다 실행

  return null; // 아무것도 렌더링하지 않음
}
  
function App() {
  return (
    <AuthProvider> {/* ✅ 여기서 Provider 감싸기 */}
      <Router>
        <TitleUpdater />
        <Header />
        <main style={{ minHeight: "80vh" , display: "flex", alignItems: "center", width: "100%"}}>
        <Routes>
          <Route path="/" element={<ClassroomList />} />
          <Route path="/classroom/:classId" element={<ClassroomDetail />} />
          <Route path="/classroom/:classId/attendance" element={<AttendancePage />} />
          <Route path="/classroom/:classId/manage-attendance" element={<ManageAttendancePage />} />
          <Route path="/classroom/:classId/settings" element={<ClassSettings />} />
          <Route path="/classroom/:classId/score" element={<ScoreManagement />} />
          <Route path="/sortgs" element={<SortgsPage />} />
        </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
