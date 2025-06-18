import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import { fetchFinalSummary, fetchFinalSummaryBasic } from '../api/finalSummaryApi';
import "../styles/FinalSummary.css";
import * as XLSX from 'xlsx';

const FinalSummary = ({ classId }) => {
  const [students, setStudents] = useState([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [isGradingMode, setIsGradingMode] = useState(false);
  const [gradeRanges, setGradeRanges] = useState([
    { grade: 'A+', min: 90, max: 100 },
    { grade: 'A', min: 80, max: 89.9999 },
    { grade: 'B+', min: 70, max: 79.9999 },
    { grade: 'B', min: 60, max: 69.9999 },
    { grade: 'C+', min: 50, max: 59.9999 },
    { grade: 'C', min: 40, max: 49.9999 },
    { grade: 'D+', min: 30, max: 39.9999 },
    { grade: 'D', min: 20, max: 29.9999 },
    { grade: 'F', min: 0, max: 19.9999 },
  ]);
  const fixedZeroList = [
    '2024120090', '2022131034', '2023130579',
    '2016130421', '2017171041', '2023150440'
  ];

  // sortConfig.key = column field, sortConfig.direction = 'asc' or 'desc'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const toggleDay = (dayIdx) => {
    setSelectedDays((prev) =>
      prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx]
    );
  };

  // 기본(첫 렌더링 시)에는 "단과대학 ↑, 학과 ↑, 학번 ↑" 순으로 multi-level 정렬
useEffect(() => {
  const calculateFixedAttendance = async () => {
    const data = await fetchFinalSummaryBasic(classId); // 출석 일수 계산 없이 전체 목록 조회

    const updated = data.map((s) => {
      const isZeroTarget = fixedZeroList.includes(String(s.studentId));
      const attendanceCalculated = isZeroTarget ? 0 : 20;
      const midtermScore = Number(s.score) || 0;
      const finalScore = Number(s.finalScore) || 0;
      const totalScore = attendanceCalculated + midtermScore + finalScore;
      const grade = applyGradeWithLimit(totalScore, s.remarks, isZeroTarget);

      return {
        ...s,
        attendanceCalculated, // ✅ 별도 필드로 사용
        totalScore,
        grade
      };
    });

    updated.sort((a, b) => {
      if (a.university !== b.university) return a.university.localeCompare(b.university);
      if (a.department !== b.department) return a.department.localeCompare(b.department);
      return a.studentId.localeCompare(b.studentId);
    });

    setStudents(updated);
    setSortConfig({ key: null, direction: 'asc' });
  };

  calculateFixedAttendance();
}, [classId]);


  const handleCalculateAttendance = async () => {
    if (!startDate || !endDate) {
      alert("시작일과 종료일을 모두 선택해주세요.");
      return;
    }

    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    const mysqlDays = selectedDays.map((d) => (d === 6 ? 1 : d + 2));

    const data = await fetchFinalSummary({
      classId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      days: mysqlDays.join(','),
      semester: "2025-1",
    });

const updated = data.map((s) => {
  const isZeroTarget = fixedZeroList.includes(s.studentId);
const attendanceCalculated = isZeroTarget ? 0 : 20;
  const midtermScore = s.score ?? 0;
  const finalScore = s.finalScore ?? 0;
  const totalScore = attendanceCalculated + midtermScore + finalScore;
  const grade = applyGradeWithLimit(totalScore, s.remarks, isZeroTarget);

  return { ...s, attendanceCalculated, totalScore, grade };
});


    // 출석 계산 후에도 기본 정렬 적용하려면:
    updated.sort((a, b) => {
      if (a.university !== b.university) return a.university.localeCompare(b.university);
      if (a.department !== b.department) return a.department.localeCompare(b.department);
      return a.studentId.localeCompare(b.studentId);
    });
    setStudents(updated);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleGradeChange = (idx, field, value) => {
    const newRanges = [...gradeRanges];
    newRanges[idx][field] = parseFloat(value);
    setGradeRanges(newRanges);
  };

  const handleApplyGradeRanges = () => {
  const sorted = [...gradeRanges].sort((a, b) => a.min - b.min);

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    // 중복 또는 역전 확인
    if (current.max >= next.min || current.min >= current.max || next.min >= next.max) {
      alert(`점수 구간이 겹치거나 잘못 설정되었습니다.\n확인: ${current.grade} ~ ${next.grade}`);
      return;
    }
  }

  const updated = students.map((s) => {
    const isZeroTarget = fixedZeroList.includes(String(s.studentId));
    const grade = applyGradeWithLimit(s.totalScore, s.remarks, isZeroTarget);
    return { ...s, grade };
  });

  setStudents(updated);
  setShowGradeModal(false);
};


  // PieChart 데이터
  const gradePieData = gradeRanges
    .map((g) => ({
      grade: g.grade,
      count: students.filter((s) => s.grade && s.grade === g.grade).length,
    }))
    .filter((g) => g.count > 0);

  // 등급 우선순위
  const gradeOrder = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];
  const getMaxAllowedGrade = (remarks = '') => {
    if (remarks.includes('삼수강')) return 'B+';
    if (remarks.includes('재수강')) return 'A';
    return null;
  };
const applyGradeWithLimit = (score, remarks, isZeroTarget) => {
  // ✅ 고정 출석 0 대상이면 무조건 F
  if (isZeroTarget) return 'F';

  const baseGradeInfo = gradeRanges.find((g) => score >= g.min && score <= g.max) || { grade: 'F' };
  const maxAllowedGrade = getMaxAllowedGrade(remarks);
  if (!maxAllowedGrade) return baseGradeInfo.grade;

  const maxGradeInfo = gradeRanges.find((g) => g.grade === maxAllowedGrade);
  if (!maxGradeInfo) return baseGradeInfo.grade;

  return score > maxGradeInfo.max ? maxAllowedGrade : baseGradeInfo.grade;
};

  // 컬럼별 토글 정렬
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // 이미 같은 key로 정렬 중이면 방향 토글
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      // 새로 정렬 키가 지정되면 오름차순으로 초기화
      return { key, direction: 'asc' };
    });
  };

  // 정렬된 students 배열
  const sortedStudents = [...students].sort((a, b) => {
    if (!sortConfig.key) return 0; // key가 없으면 기존 순서 유지
    const aVal = a[sortConfig.key] ?? '';
    const bVal = b[sortConfig.key] ?? '';
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // 기본 정렬(단과대학↑, 학과↑, 학번↑)로 되돌리기
  const handleResetSort = () => {
    const resetList = [...students].sort((a, b) => {
      if (a.university !== b.university) return a.university.localeCompare(b.university);
      if (a.department !== b.department) return a.department.localeCompare(b.department);
      return a.studentId.localeCompare(b.studentId);
    });
    setStudents(resetList);
    setSortConfig({ key: null, direction: 'asc' });
  };

  // 엑셀 다운로드 (현재 정렬 상태 반영)
  const handleDownloadExcel = () => {
    const headers = isGradingMode
      ? ['단과대학', '학과', '학번', '이름', '비고', '등급']
      : ['단과대학', '학과', '학번', '이름', '비고', '출석(20)', '중간(40)', '기말(40)', '총점', '등급'];

    // sortedStudents 사용해서 다운로드 시에도 동일 순서 유지
    const rows = sortedStudents.map((s) => {
      const baseData = [s.university, s.department, s.studentId, s.name, s.remarks];
      if (isGradingMode) {
        return [...baseData, s.grade ?? '-'];
      } else {
        return [
          ...baseData,
          s.attendanceCalculated ?? '-',
          s.score ?? 0,
          s.finalScore ?? 0,
          s.totalScore ?? '-',
          s.grade ?? '-',
        ];
      }
    });

    // 점수 구간 섹션
    const sortedGradeRanges = [...gradeRanges].sort((a, b) => b.min - a.min);
    const gradeSection = [
      [],
      ['현재 점수 구간'],
      ['등급', '점수 구간'],
      ...sortedGradeRanges.map((gr) => [gr.grade, `${gr.min} ~ ${gr.max}`]),
    ];

    const finalSheetData = [headers, ...rows, ...gradeSection];
    const worksheet = XLSX.utils.aoa_to_sheet(finalSheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '성적표');

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `최종성적집계_${today}.xlsx`);
  };

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      <h2>최종 성적 집계</h2>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button onClick={() => setShowGradeModal(true)}>점수 구간 설정</button>
        <button onClick={() => setIsGradingMode((prev) => !prev)}>
          {isGradingMode ? '전체 보기' : '채점 모드'}
        </button>
        <button onClick={handleDownloadExcel}>엑셀 다운로드</button>
        <button onClick={handleResetSort}>기본 정렬</button>
      </div>

      {/* PieChart (등급 분포) */}
      <div
        style={{
          position: 'absolute',
          right: '2rem',
          top: '2rem',
          backgroundColor: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      >
        <PieChart width={360} height={270}>
          <Pie
            data={gradePieData}
            dataKey="count"
            nameKey="grade"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {gradePieData.map((entry, index) => {
              const colorMap = {
                'A+': '#FF0000',
                'A': '#FF6666',
                'B+': '#FFA500',
                'B': '#FFD580',
                'C+': '#66CC66',
                'C': '#CCFFCC',
                'D+': '#3399FF',
                'D': '#ADD8E6',
                'F': '#A9A9A9',
              };
              return <Cell key={`cell-${index}`} fill={colorMap[entry.grade] || '#CCCCCC'} />;
            })}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>

      {/* 점수 구간 설정 모달 */}
      {showGradeModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setShowGradeModal(false)}
        >
          <div
            className="modal"
            style={{
              position: 'fixed',
              top: '150px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '8px',
              zIndex: 1000,
              width: 'min(90%, 400px)',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>점수 구간 설정</h3>
            {gradeRanges.map((g, idx) => (
              <div key={idx} style={{ marginBottom: '0.5rem' }}>
                <label>{g.grade}</label>
                <input
                  type="number"
                  value={g.min}
                  onChange={(e) => handleGradeChange(idx, 'min', e.target.value)}
                  style={{ margin: '0 4px' }}
                />
                ~
                <input
                  type="number"
                  value={g.max}
                  onChange={(e) => handleGradeChange(idx, 'max', e.target.value)}
                  style={{ margin: '0 4px' }}
                />
              </div>
            ))}
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button onClick={handleApplyGradeRanges} style={{ marginRight: '1rem' }}>
                반영
              </button>
              <button onClick={() => setShowGradeModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 최종 성적 테이블 */}
      <table className="summary-table" style={{ marginTop: '14rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th onClick={() => handleSort('university')}>
              단과대학 {sortConfig.key === 'university' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
            </th>
            <th onClick={() => handleSort('department')}>
              학과 {sortConfig.key === 'department' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
            </th>
            <th onClick={() => handleSort('studentId')}>
              학번 {sortConfig.key === 'studentId' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
            </th>
            <th style={{ maxWidth: '100px' }} onClick={() => handleSort('name')}>
              이름 {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
            </th>
            <th onClick={() => handleSort('remarks')}>
              비고 {sortConfig.key === 'remarks' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
            </th>
            {isGradingMode ? (
              <th onClick={() => handleSort('grade')}>
                등급 {sortConfig.key === 'grade' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
              </th>
            ) : (
              <>
                <th onClick={() => handleSort('attendanceCalculated')}>
                  출석(20) {sortConfig.key === 'attendanceCalculated' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
                </th>
                <th onClick={() => handleSort('score')}>
                  중간(40) {sortConfig.key === 'score' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
                </th>
                <th onClick={() => handleSort('finalScore')}>
                  기말(40) {sortConfig.key === 'finalScore' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
                </th>
                <th onClick={() => handleSort('totalScore')}>
                  총점 {sortConfig.key === 'totalScore' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
                </th>
                <th onClick={() => handleSort('grade')}>
                  등급 {sortConfig.key === 'grade' ? (sortConfig.direction === 'asc' ? '🔼' : '🔽') : ''}
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((s) => (
            <tr key={s.studentId}>
              <td>{s.university}</td>
              <td>{s.department}</td>
              <td>{s.studentId}</td>
              <td style={{ maxWidth: '100px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                {s.name}
              </td>
              <td
                style={{
                  width: "80px",
                  textAlign: "center",
                  color: s.remarks?.includes("동명이인") ? "#E17100" : "inherit",
                  fontWeight: s.remarks?.includes("동명이인") ? "bold" : "normal",
                }}
              >
                {s.remarks}
              </td>
              {isGradingMode ? (
                <td>{s.grade ?? '-'}</td>
              ) : (
                <>
                  <td>{s.attendanceCalculated ?? '-'}</td>
                  <td>{s.score ?? 0}</td>
                  <td>{s.finalScore ?? 0}</td>
                  <td>{s.totalScore ?? '-'}</td>
                  <td>{s.grade ?? '-'}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinalSummary;
