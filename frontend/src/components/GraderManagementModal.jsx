import { useEffect, useState } from "react";
import {
  fetchGradersBySemester,
  addGrader,
  updateGrader,
  deleteGrader,
} from "../api/graderApi";

const colorOptions = [
    { color: "#7C0019", label: "버건디" },
    { color: "#FFDC00", label: "노랑" },
    { color: "#FF69B4", label: "핑크" },     
    { color: "#007BFF", label: "파랑" },
    { color: "#28A745", label: "초록" },
    { color: "#6F42C1", label: "보라" },
    { color: "#808080", label: "기타" }, 
  ];

const GraderManagementModal = ({ semester, onClose }) => {
  const [graders, setGraders] = useState([]);
  const [newGraderName, setNewGraderName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].color);

  useEffect(() => {
    const loadGraders = async () => {
      if (!semester) return;
  
      const existing = await fetchGradersBySemester(semester);
  
      const hasEtc = existing.some(g => g.graderName === "기타");
      if (!hasEtc) {
        await addGrader({ semester, graderName: "기타", color: "#808080" });
        const updated = await fetchGradersBySemester(semester);
        setGraders(updated);
      } else {
        setGraders(existing);
      }
    };
  
    loadGraders();
  }, [semester]);
  

  const handleAdd = async () => {
    if (graders.length >= 6) return alert("최대 6명까지만 등록할 수 있습니다.");
    if (!newGraderName.trim()) return alert("채점자 이름을 입력하세요.");
  
    // ✅ 같은 색상으로 이미 등록된 채점자가 있는지 확인
    const isColorTaken = graders.some((g) => g.color === selectedColor);
    if (isColorTaken) return alert("이미 사용 중인 색상입니다. 다른 색상을 선택하세요.");
  
    try {
      await addGrader({ semester, graderName: newGraderName, color: selectedColor });
      const updated = await fetchGradersBySemester(semester);
      setGraders(updated);
      setNewGraderName("");
      setSelectedColor(colorOptions[0]);
    } catch (error) {
      console.error("채점자 추가 오류:", error);
      alert("채점자 추가 실패");
    }
  };
  
  const handleUpdate = async (grader) => {
    const newName = prompt("새 이름:", grader.graderName);
    if (!newName.trim()) return;
  
    try {
      await updateGrader({ ...grader, graderName: newName });
  
      // ✅ UI에서 먼저 반영 (빠른 사용자 피드백)
      setGraders((prev) =>
        prev.map((g) =>
          g.graderId === grader.graderId ? { ...g, graderName: newName } : g
        )
      );
  
      // ✅ 서버 데이터로 한 번 더 동기화 (정확성 보장)
      const updated = await fetchGradersBySemester(semester);
      setGraders(updated);
    } catch (error) {
      console.error("채점자 수정 오류:", error);
      alert("채점자 수정 실패");
    }
  };
  

  const handleDelete = async (graderId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteGrader(graderId);
  
      // 1차: UI에서 먼저 삭제
      setGraders((prev) => prev.filter((g) => g.graderId !== graderId));
  
      // 2차: 최신 상태 보장 위해 서버 재조회
      const updated = await fetchGradersBySemester(semester);
      setGraders(updated);
    } catch (error) {
      console.error("채점자 삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };
  

  return (
    <div className="modal-overlay">
      <div className="modal-content2">
        <h2>{semester} 채점자 관리</h2>

        <div className="form">
          <input
            type="text"
            placeholder="채점자 이름"
            value={newGraderName}
            onChange={(e) => setNewGraderName(e.target.value)}
          />
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            >
           {colorOptions.map(({ color, label }) => {
            const isEtc = label === "기타";
            const isUsed = graders.some((g) => g.color === color);
            return (
                <option
                key={color}
                value={color}
                disabled={!isEtc && isUsed}
                >
                {label} {isUsed && !isEtc ? "(사용중)" : ""}
                </option>
            );
            })}
            </select>


          <button onClick={handleAdd}>추가</button>
        </div>

        <table className="grader-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>색상</th>
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
          {graders.map((g) => (
            <tr key={g.graderId}>
                <td>{g.graderName}</td>
                <td style={{ textAlign: "center" }}>
                <div
                    style={{
                    backgroundColor: g.color,
                    width: "30px",
                    height: "20px",
                    borderRadius: "4px",
                    margin: "0 auto"
                    }}
                ></div>
                </td>
                <td>
                {g.graderName === "기타" ? (
                    "-"
                ) : (
                    <button onClick={() => handleUpdate(g)} className="button-edit">수정</button>
                )}
                </td>
                <td>
                {g.graderName === "기타" ? (
                    "-"
                ) : (
                    <button onClick={() => handleDelete(g.graderId)} className="button-cancel">삭제</button>
                )}
                </td>
            </tr>
            ))}
          </tbody>
        </table>

        <button onClick={onClose} style={{ marginTop: "1rem" }} className="button-cancel">
          닫기
        </button>
      </div>
    </div>
  );
};

export default GraderManagementModal;
