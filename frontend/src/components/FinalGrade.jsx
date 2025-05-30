import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { fetchFinalGradeWithStudents, updateFinalScore, updateMultipleFinalScores, updateFinalGraderName } from "../api/scoreApi";
import { fetchGradersBySemester } from "../api/graderApi";
import GraderManagementModal from "../components/GraderManagementModal";
import * as XLSX from "xlsx";
import { sendGradeUpdate } from "../utils/socket";

const FinalGrade = ({ classId, semester, onStudentsUpdate, onEditingChange }, ref) => {
  const [students, setStudents] = useState([]);
  const [graderName, setGraderName] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingIds, setEditingIds] = useState([]);
  const [showGraderModal, setShowGraderModal] = useState(false);
  const [graders, setGraders] = useState([]);
  const [filterGrader, setFilterGrader] = useState("");

  const clearSelections = () => {
    setSelectedIds([]);
  };

  // 변경 여부를 확인하는 함수
  const hasChanged = (a, b) => {
    const scoreA = String(a.score ?? "").trim();
    const scoreB = String(b.score ?? "").trim();
    const penaltyA = (a.penaltyReason ?? "").trim();
    const penaltyB = (b.penaltyReason ?? "").trim();
    const graderA = (a.graderName ?? "").trim();
    const graderB = (b.graderName ?? "").trim();
  
    const changed =
      scoreA !== scoreB ||
      penaltyA !== penaltyB ||
      graderA !== graderB;
  
    if (changed) {
      console.log("📌 변경 감지됨:", {
        studentId: a.studentId,
        기존값: { score: scoreA, penalty: penaltyA, grader: graderA },
        새값: { score: scoreB, penalty: penaltyB, grader: graderB },
      });
    }
  
    return changed;
  };
  
  

  const handleDownloadExcel = () => {
    const wsData = [
      ["단과대학", "학과", "학번", "이름", "비고", "점수", "감점사유", "채점자"],
      ...sortedStudents.map((s) => [
        s.university,
        s.department,
        s.studentId,
        s.name,
        s.remarks || "",
        s.score || "",
        s.penaltyReason || "",
        s.graderName || "",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "기말고사 성적");

    XLSX.writeFile(workbook, `기말고사_성적_${semester}.xlsx`);
  };

  const [selectedGraderId, setSelectedGraderId] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const sortedStudents = [...students].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (!key) return 0;
    const valA = a[key] || "";
    const valB = b[key] || "";
    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  // 추가: 정렬된 데이터에서 채점자 필터링
  const filteredStudents = sortedStudents.filter((s) =>
  filterGrader ? s.graderName === filterGrader : true
);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const mergeUpdatedStudents = (incoming) => {
    console.log("🧠 병합 시작 - 현재 학생 수:", students.length);
    console.log("🔍 기존 students:", students.map(s => `${s.studentId}:${s.score}`));
    console.log("🆕 들어온 데이터:", incoming.map(s => `${s.studentId}:${s.score}`));
  
    const merged = students.map((s) => {
       
        if (editingIds.includes(s.studentId)) {
          return s;
        }
      
        const incomingMatch = incoming.find((i) => i.studentId === s.studentId);
        if (!incomingMatch) return s;
      
        if (hasChanged(s, incomingMatch)) {
          console.log(`🔁 ${s.studentId} - 병합 대상`);
          return { ...s, ...incomingMatch };
        }
      
        return s;
      });
  
    console.log("✅ 병합 완료: 병합된 데이터로 강제 갱신");
    setStudents(merged.map(s => ({ ...s })));               // 무조건 갱신
    onStudentsUpdate?.(merged);              // 상위에도 반영
  };
  
  useImperativeHandle(ref, () => ({
    mergeUpdatedStudents,
  }));

  useEffect(() => {
    if (classId && semester) {
      fetchFinalGradeWithStudents(classId, semester)
        .then((data) => {
          const valid = data.filter((s) => s && s.studentId);
          setStudents(valid);
          onStudentsUpdate?.(valid);
        });

      fetchGradersBySemester(semester)
        .then((data) => setGraders(data))
        .catch((err) => console.error("채점자 불러오기 실패:", err));
    }
  }, [classId, semester]);

  useEffect(() => {
    onEditingChange?.(editingIds);
  }, [editingIds]);

  const handleBulkSave = async () => {
    const selectedStudents = students.filter((s) => selectedIds.includes(s.studentId));
    if (selectedStudents.length === 0) return alert("저장할 학생을 선택하세요.");
    try {
      await updateMultipleFinalScores(selectedStudents.map((s) => ({
        studentId: s.studentId,
        classId,
        semester,
        score: s.score || null,
        penaltyReason: s.penaltyReason || null,
        graderName: s.graderName || null,
      })));
      alert("선택한 학생들의 점수와 감점사유가 저장되었습니다.");
      const updated = await fetchFinalGradeWithStudents(classId, semester);
      mergeUpdatedStudents(updated);
      await sendGradeUpdate({ classId, semester });
    } catch (error) {
      console.error("일괄 저장 실패:", error);
      alert("일괄 저장 중 오류가 발생했습니다.");
    }
  };

  const handleSave = async (student) => {
    try {
      const graderNameToUse = student.graderName || (graders.find((g) => g.graderId === selectedGraderId)?.graderName ?? "");
      await updateFinalScore({
        classId,
        semester,
        studentId: student.studentId,
        score: student.score,
        penaltyReason: student.penaltyReason || "",
        graderName: graderNameToUse
      });
      alert(`${student.name} 학생의 점수와 감점사유가 저장되었습니다.`);
      const updated = await fetchFinalGradeWithStudents(classId, semester);
      mergeUpdatedStudents(updated);
      await sendGradeUpdate({ classId, semester });
    } catch (error) {
      console.error("점수 저장 실패:", error);
      alert("점수 저장 중 오류가 발생했습니다.");
    }
  };

  const handleScoreChange = (studentId, value) => {
    setEditingIds((prev) => [...new Set([...prev, studentId])]);
    let filtered = value.replace(/[^0-9.]/g, "");
    const firstDotIndex = filtered.indexOf(".");
    if (firstDotIndex !== -1) {
      const beforeDot = filtered.slice(0, firstDotIndex);
      const afterDot = filtered.slice(firstDotIndex + 1).replace(/\./g, "");
      filtered = beforeDot + "." + afterDot;
    }
    let finalValue = "";
    if (!filtered.includes(".")) {
      if (filtered.length === 0) finalValue = "";
      else if (filtered.length <= 2) finalValue = filtered;
      else finalValue = `${filtered.slice(0, 2)}.${filtered.slice(2, 3)}`;
    } else {
      const parts = filtered.split(".");
      const intPart = parts[0].slice(0, 2);
      const decPart = parts[1]?.slice(0, 1) || "";
      finalValue = decPart !== "" ? `${intPart}.${decPart}` : intPart;
      if (filtered.endsWith(".")) finalValue = `${intPart}.`;
    }
    setStudents((prev) => prev.map((s) => (s.studentId === studentId ? { ...s, score: finalValue } : s)));
  };

  const handlePenaltyChange = (studentId, value) => {
    setEditingIds((prev) => [...new Set([...prev, studentId])]);
    setStudents((prev) => prev.map((s) => (s.studentId === studentId ? { ...s, penaltyReason: value } : s)));
  };

  const handleSelect = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const applyGraderName = async () => {
    const grader = graders.find((g) => String(g.graderId) === selectedGraderId);
    if (!grader) return alert("채점자를 선택해주세요.");
    setStudents((prev) =>
      prev.map((s) =>
        selectedIds.includes(s.studentId)
          ? { ...s, graderName: grader.graderName, graderColor: grader.color }
          : s
      )
    );
    try {
      await updateFinalGraderName({ classId, semester, graderName: grader.graderName, studentIds: selectedIds });
      alert("선택한 학생들의 채점자명이 저장되었습니다.");
      const updated = await fetchFinalGradeWithStudents(classId, semester);
      mergeUpdatedStudents(updated);
      await sendGradeUpdate({ classId, semester });
    } catch (error) {
      console.error("채점자 저장 실패:", error);
      alert("채점자 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="midterm-grade-wrapper">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
    <h3>기말고사 성적 관리 - {semester}</h3>

    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "10px", marginBottom: "10px" }}>
      <label htmlFor="filterGrader">채점자 필터:</label>
      <select
        id="filterGrader"
        value={filterGrader}
        onChange={(e) => setFilterGrader(e.target.value)}
      >
        <option value="">전체 보기</option>
        {graders.map((g) => (
          <option key={g.graderId} value={g.graderName}>
            {g.graderName}
          </option>
        ))}
      </select>
    </div>

    <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={handleDownloadExcel} className="button-save" style={{ marginLeft: "10px" }}>
        엑셀 다운로드
        </button>
        <button onClick={() => setShowGraderModal(true)}>채점자 관리</button>
        <button onClick={() => setSortConfig({ key: null, direction: "asc" })}>
            기본 정렬
        </button>
        <button
          onClick={() => {
            if (selectedIds.length === filteredStudents.length) {
              setSelectedIds([]); // 모두 해제
            } else {
              setSelectedIds(filteredStudents.map((s) => s.studentId)); // 모두 선택
            }
          }}
          className="button-cancel"
        >
          전체 선택/해제
        </button>
    </div>
    </div>
      <table className="grade-table">
        <thead>
          <tr>
            <th>선택</th>
            <th onClick={() => handleSort("university")}>단과대학 {sortConfig.key === "university" && (sortConfig.direction === "asc" ? "🔼" : "🔽")}</th>
            <th onClick={() => handleSort("department")}>학과 {sortConfig.key === "department" && (sortConfig.direction === "asc" ? "🔼" : "🔽")}</th>
            <th onClick={() => handleSort("studentId")}>학번 {sortConfig.key === "studentId" && (sortConfig.direction === "asc" ? "🔼" : "🔽")}</th>
            <th onClick={() => handleSort("name")}>이름 {sortConfig.key === "name" && (sortConfig.direction === "asc" ? "🔼" : "🔽")}</th>
            <th onClick={() => handleSort("remarks")}>비고 {sortConfig.key === "remarks" && (sortConfig.direction === "asc" ? "🔼" : "🔽")}</th>
            <th onClick={() => handleSort("score")}>점수 {sortConfig.key === "score" && (sortConfig.direction === "asc" ? "🔼" : "🔽")}</th>
            <th onClick={() => handleSort("penaltyReason")}>감점사유 {sortConfig.key === "penaltyReason" && (sortConfig.direction === "asc" ? "🔼" : "🔽")}</th>
            <th onClick={() => handleSort("graderName")}>채점자 {sortConfig.key === "graderName" && (sortConfig.direction === "asc" ? "🔼" : "🔽")}</th>
            <th>저장</th>
          </tr>
        </thead>
        <tbody>
  {filteredStudents.map((s) => (
    <tr
      key={s.studentId}
      className={selectedIds.includes(s.studentId) ? "selected-row" : ""}
    >
      <td onClick={() => handleSelect(s.studentId)} style={{ cursor: "pointer", textAlign: "center", width: "40px" }}>
        <input
          type="checkbox"
          style={{ width: "18px", height: "18px" }}
          checked={selectedIds.includes(s.studentId)}
          onChange={() => handleSelect(s.studentId)}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
              <td style={{
                    width: "100px",       // 적절한 픽셀 값
                    textAlign: "center", // 가운데 정렬 (가독성↑)
                }}>{s.university}</td>
              <td style={{
                    width: "100px",       // 적절한 픽셀 값
                    textAlign: "center", // 가운데 정렬 (가독성↑)
                }}>{s.department}</td>
              <td>{s.studentId}</td>
              <td style={{
                    width: "120px",       // 적절한 픽셀 값
                    textAlign: "center", // 가운데 정렬 (가독성↑)
                }}>{s.name}</td>
              <td
                style={{
                    width: "80px", // 원하는 너비로 조정 (ex. 60~100px 정도 추천)
                    textAlign: "center",
                    color: s.remarks?.includes("동명이인") ? "#E17100" : "inherit",
                    fontWeight: s.remarks?.includes("동명이인") ? "bold" : "normal",
                }}
                >
                {s.remarks}
                </td>
              <td>
              <input
                type="text"
                value={s.score || ""}
                onChange={(e) => handleScoreChange(s.studentId, e.target.value)}
                style={{
                    width: "30px",       // 적절한 픽셀 값
                    textAlign: "center", // 가운데 정렬 (가독성↑)
                }}
                />
              </td>
              <td>
              <textarea
                value={s.penaltyReason || ""}
                onChange={(e) => {
                  handlePenaltyChange(s.studentId, e.target.value);

                  // 🔄 자동 줄바꿈 대응 (높이 자동 조절)
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                style={{
                  width: "150px",
                  fontSize: "12px",
                  fontFamily: "'Malgun Gothic', sans-serif",
                  lineHeight: "1.4",
                  padding: "4px",
                  overflow: "hidden",      // 🔄 줄바꿈 감지 가능
                  resize: "none",          // 사용자 수동 조절 금지
                  minHeight: "30px",       // ✅ 최소 높이 지정
                  boxSizing: "border-box", // ✅ 패딩 포함 계산
                }}
              />

              </td>
              <td style={{
                    width: "50px",       // 적절한 픽셀 값
                    textAlign: "center", // 가운데 정렬 (가독성↑)
                }}>
                {s.graderName ? (
                    <span
                    style={{
                        backgroundColor: graders.find((g) => g.graderName === s.graderName)?.color || "#ccc",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        color: "#fff",
                        fontWeight: "bold",
                    }}
                    >
                    {s.graderName}
                    </span>
                ) : (
                    "-"
                )}
                </td>
              <td>
                <button onClick={() => handleSave(s)}>저장</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grader-control" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
        {/* 왼쪽: 채점자 선택 및 일괄 적용 */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
            value={selectedGraderId}
            onChange={(e) => setSelectedGraderId(e.target.value)}
            >
            <option value="">채점자 선택</option>
            {graders.map((g) => (
                <option key={g.graderId} value={g.graderId}>
                {g.graderName}
                </option>
            ))}
            </select>
            <button onClick={applyGraderName} className="ilgual-button">채점자 일괄 배정</button>
        </div>

        {/* 오른쪽: 일괄 저장 */}
        <div>
            <button onClick={handleBulkSave} className="button-save">
            전체 평가내용 일괄 저장
            </button>
        </div>
        </div>

      {showGraderModal && (
        <GraderManagementModal
            semester={semester}
            onClose={() => setShowGraderModal(false)}
        />
        )}
    </div>
  );
};

export default forwardRef(FinalGrade);