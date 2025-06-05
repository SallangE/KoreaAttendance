import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { fetchClassDetail } from "../api/classroomApi";
import { useAuth } from "../context/AuthContext";
import { fetchSemestersByClassId, createSemester } from "../api/semesterApi";
import { fetchGradeWithStudents } from "../api/scoreApi";
import MidtermGrade from "../components/MidtermGrade";
import FinalGrade from "../components/FinalGrade";
import FinalSummary from "../components/FinalSummary";
import GradeStats from "../components/GradeStats";
import "../styles/ScoreManagement.css";
import { connectWebSocket } from "../utils/socket";

const generateCurrentSemester = () => {
  const now = new Date();
  const year = now.getFullYear();
  const term = now.getMonth() + 1 < 7 ? 1 : 2;
  return `${year}-${term}`;
};

const ScoreManagement = () => {
  const { classId } = useParams();
  const { user } = useAuth();
  const [classDetail, setClassDetail] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const [semesterList, setSemesterList] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [newSemesterInput, setNewSemesterInput] = useState("");
  const [studentData, setStudentData] = useState([]);
  const [editingIds, setEditingIds] = useState([]);
  const editingRef = useRef([]);
  const midtermGradeRef = useRef();
  const finalGradeRef = useRef();

  useEffect(() => {
    editingRef.current = editingIds;
  }, [editingIds]);

  const scoredStudents = studentData.filter(s => s.score !== null && s.score !== undefined && s.score !== "");
  const minScore = scoredStudents.length > 0 ? Math.min(...scoredStudents.map(s => parseFloat(s.score))) : "없음";
  const averageScore = scoredStudents.length > 0 ? (scoredStudents.reduce((acc, s) => acc + parseFloat(s.score), 0) / scoredStudents.length).toFixed(1) : "없음";

  useEffect(() => {
    connectWebSocket((message) => {
      if (String(message.classId) === String(classId) && message.semester === selectedSemester) {
        console.log("📩 받은 메시지:", message);
  
        fetchGradeWithStudents(classId, selectedSemester).then((newData) => {
          const valid = newData.filter(s => s && s.studentId);
          console.log("🎯 새로 받은 서버 데이터:", valid);
  
          // MidtermGrade 내부 병합 함수 직접 호출
          if (midtermGradeRef.current?.mergeUpdatedStudents) {
            console.log("📞 mergeUpdatedStudents 호출 전 studentId들:", valid.map(s => `${s.studentId}:${s.score}`));
            midtermGradeRef.current.mergeUpdatedStudents(valid);
          }

          if (finalGradeRef.current?.mergeUpdatedStudents) {
            finalGradeRef.current.mergeUpdatedStudents(valid);
          }
        });
      }
    });
  }, [classId, selectedSemester]);
  

  useEffect(() => {
    fetchClassDetail(classId)
      .then((data) => setClassDetail(data))
      .catch((error) => console.error("❌ 강의실 정보 불러오기 오류:", error));
  }, [classId]);

  useEffect(() => {
    fetchSemestersByClassId(classId).then((data) => {
      if (data.length === 0) {
        const defaultSemester = generateCurrentSemester();
        createSemester({ classId, semester: defaultSemester })
          .then(() => fetchSemestersByClassId(classId))
          .then((semesters) => {
            setSemesterList(semesters);
            setSelectedSemester(semesters[semesters.length - 1].semester);
          });
      } else {
        setSemesterList(data);
        setSelectedSemester(data[data.length - 1].semester);
      }
    });
  }, [classId]);

  useEffect(() => {
    switch (selectedMenu) {
      case "midterm":
        setActiveComponent(
          <MidtermGrade
            ref={midtermGradeRef}
            classId={classId}
            semester={selectedSemester}
            onStudentsUpdate={setStudentData}
            onEditingChange={setEditingIds}
          />
        );
        break;
      case "final":
        setActiveComponent(
          <FinalGrade
            ref={finalGradeRef}
            classId={classId}
            semester={selectedSemester}
            onStudentsUpdate={setStudentData}
            onEditingChange={setEditingIds}
          />
        );
        break;
      case "summary":
        setActiveComponent(<FinalSummary classId={classId} semester={selectedSemester} />);
        break;
      case "stats":
        setActiveComponent(<GradeStats classId={classId} semester={selectedSemester} />);
        break;
      default:
        setActiveComponent(null);
    }
  }, [selectedMenu, classId, selectedSemester]);

  if (!classDetail) return <p>클래스 정보를 불러오는 중...</p>;

  return (
    <div className="classroom-detail-wrapper" style={{ position: "relative" }}>
      <div className="classroom-detail-container">
        <h2>{classDetail.className}</h2>
        <p><strong>교수자:</strong> {classDetail.professorName}</p>
        <p><strong>이메일:</strong> {classDetail.professorEmail}</p>
      </div>

      <div className="classroom-detail-container">
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select className="semester-select" value={selectedSemester || ""} onChange={(e) => setSelectedSemester(e.target.value)}>
            {semesterList.map((s) => (
              <option key={s.semester} value={s.semester}>{s.semester}</option>
            ))}
          </select>
          <button className="add-semester-button" onClick={() => setShowSemesterModal(true)}>+ 학기 추가</button>
        </div>
      </div>

      {selectedSemester && (
        <div className="classroom-layout">
          <div className="classroom-menu">
            <button className="menu-button" onClick={() => setSelectedMenu("midterm")}>중간고사 성적</button>
            <button className="menu-button" onClick={() => setSelectedMenu("final")}>기말고사 성적</button>
            <button className="menu-button" onClick={() => setSelectedMenu("summary")}>최종 성적 집계</button>
            <button className="menu-button" style={{ backgroundColor: "gray" }} onClick={() => setSelectedMenu("stats")}>통계</button>

            {(selectedMenu === "midterm" || selectedMenu === "final") && (
              <>
                <hr style={{ margin: "10px 0" }} />
                <div className="grade-summary" style={{ fontSize: "14px" }}>
                  <p>총 학생 수: {studentData.length}명</p>
                  <p>점수 미입력: {studentData.filter(s => !s.score).length}명</p>
                  <br />
                  <p style={{ fontWeight: "bold" }}>평균 점수: {averageScore}</p>
                  <p>가장 낮은 점수: {minScore}</p>
                  <br />
                  <div style={{ marginTop: "5px" }}>
                    <strong>조교별 채점 할당:</strong>
                    <ul style={{ paddingLeft: "20px" }}>
                      {Object.entries(
                        studentData.filter(s => s.graderName).reduce((acc, s) => {
                          acc[s.graderName] = (acc[s.graderName] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, count]) => (
                        <li key={name}>{name}: {count}명</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="classroom-content">
            {activeComponent || <p>메뉴에서 항목을 선택해주세요.</p>}
          </div>
        </div>
      )}

      {showSemesterModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>학기 추가</h3>
            <input type="text" placeholder="예: 2025-1" value={newSemesterInput} onChange={(e) => setNewSemesterInput(e.target.value)} />
            <div className="modal-buttons">
              <button onClick={async () => {
                const trimmed = newSemesterInput.trim();
                const semesterRegex = /^\d{4}-[1-2]$/;
                if (!trimmed) return alert("학기명을 입력해주세요.");
                if (!semesterRegex.test(trimmed)) return alert("형식에 맞는 학기를 입력해주세요. 예: 2025-1");

                try {
                  await createSemester({ classId, semester: trimmed });
                  const semesters = await fetchSemestersByClassId(classId);
                  setSemesterList(semesters);
                  setSelectedSemester(trimmed);
                  setShowSemesterModal(false);
                  setNewSemesterInput("");
                } catch (err) {
                  alert("학기 추가 실패 또는 중복된 학기입니다.");
                }
              }}>추가</button>
              <button onClick={() => setShowSemesterModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreManagement;