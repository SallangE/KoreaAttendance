import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PieChart, Pie, Tooltip, Cell } from 'recharts';
import { fetchFinalSummary, fetchFinalSummaryBasic } from '../api/finalSummaryApi';
import "../styles/FinalSummary.css";
import * as XLSX from 'xlsx';

const FinalSummary = ({ classId }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [students, setStudents] = useState([]);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [isGradingMode, setIsGradingMode] = useState(false);
  const [gradeRanges, setGradeRanges] = useState([
    { grade: 'A+', min: 90, max: 100 },
    { grade: 'A', min: 80, max: 89 },
    { grade: 'B+', min: 70, max: 79 },
    { grade: 'B', min: 60, max: 69 },
    { grade: 'C+', min: 50, max: 59 },
    { grade: 'C', min: 40, max: 49 },
    { grade: 'D+', min: 30, max: 39 },
    { grade: 'D', min: 20, max: 29 },
    { grade: 'F', min: 0, max: 19 },
  ]);

  const toggleDay = (dayIdx) => {
    setSelectedDays((prev) =>
      prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx]
    );
  };

  useEffect(() => {
  const loadInitialData = async () => {
    const data = await fetchFinalSummaryBasic(classId);
    const updated = data.map((s) => ({
      ...s,
      attendanceScore: null,       // 초기에는 null
      totalScore: null,            // 계산하지 않음
      grade: null,                 // 등급도 없음
    }));
    setStudents(updated);
  };
  loadInitialData();
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
      const attendanceScore = s.absentCount >= 7 ? 0 : 20;
      const midtermScore = s.score ?? 0;
      const finalScore = s.finalScore ?? 0;
      const totalScore = attendanceScore + midtermScore + finalScore;
      const grade = applyGradeWithLimit(totalScore, s.remarks, s.absentCount);
      return { ...s, attendanceScore, totalScore, grade };
    });

    setStudents(updated);
  };

  const handleGradeChange = (idx, field, value) => {
    const newRanges = [...gradeRanges];
    newRanges[idx][field] = parseFloat(value);
    setGradeRanges(newRanges);
  };

  const handleApplyGradeRanges = () => {
    const updated = students.map((s) => {
      const grade = applyGradeWithLimit(s.totalScore, s.remarks, s.absentCount);
      return { ...s, grade };
    });
    setStudents(updated);
    setShowGradeModal(false);
  };

  const gradePieData = gradeRanges
    .map((g) => ({ grade: g.grade, count: students.filter((s) => s.grade && s.grade === g.grade).length }))
    .filter((g) => g.count > 0);

    // 등급 문자열 우선순위 정렬용
const gradeOrder = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F'];

const getMaxAllowedGrade = (remarks = '') => {
  if (remarks.includes('삼수강')) return 'B+';
  if (remarks.includes('재수강')) return 'A';
  return null;
};

const applyGradeWithLimit = (score, remarks, absentCount) => {
  if (absentCount >= 7) return 'F';  // ✅ 무조건 F

  const baseGradeInfo = gradeRanges.find(
    (g) => score >= g.min && score <= g.max
  ) || { grade: 'F' };

  const maxAllowedGrade = getMaxAllowedGrade(remarks);
  if (!maxAllowedGrade) return baseGradeInfo.grade;

  const maxGradeInfo = gradeRanges.find(g => g.grade === maxAllowedGrade);
  if (!maxGradeInfo) return baseGradeInfo.grade;

  return score > maxGradeInfo.max ? maxAllowedGrade : baseGradeInfo.grade;
};

const handleDownloadExcel = () => {
  const headers = isGradingMode
    ? ['단과대학', '학과', '학번', '이름', '비고', '등급']
    : ['단과대학', '학과', '학번', '이름', '비고', '결석 횟수', '출석(20)', '중간(40)', '기말(40)', '총점', '등급'];

  const rows = students.map((s) => {
    const baseData = [s.university, s.department, s.studentId, s.name, s.remarks];
    if (isGradingMode) {
      return [...baseData, s.grade ?? '-'];
    } else {
      return [
        ...baseData,
        s.absentCount,
        s.attendanceScore ?? '-',
        s.score ?? 0,
        s.finalScore ?? 0,
        s.totalScore ?? '-',
        s.grade ?? '-',
      ];
    }
  });

  // 점수 구간 정렬
  const sortedGradeRanges = [...gradeRanges].sort((a, b) => b.min - a.min);

  const gradeSection = [
    [],
    ['현재 점수 구간'],
    ['등급', '점수 구간'],
    ...sortedGradeRanges.map(gr => [
      gr.grade,
      `${gr.min} ~ ${gr.max}`
    ])
  ];

  // 최종 병합
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

      <div style={{ marginBottom: '1rem' }}>
        <label>시작일: </label>
        <DatePicker selected={startDate} onChange={setStartDate} />
        <label style={{ marginLeft: '1rem' }}>종료일: </label>
        <DatePicker selected={endDate} onChange={setEndDate} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
          <label key={idx} style={{ marginRight: '1rem' }}>
            <input
              type="checkbox"
              checked={selectedDays.includes(idx)}
              onChange={() => toggleDay(idx)}
            />{' '}
            {day}
          </label>
        ))}
      </div>

      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button onClick={handleCalculateAttendance}>출석 점수 반영</button>
        <button onClick={() => setShowGradeModal(true)}>점수 구간 설정</button>
        <button onClick={() => setIsGradingMode(prev => !prev)}>
          {isGradingMode ? '전체 보기' : '채점 모드'}
        </button>
        <button onClick={handleDownloadExcel}>엑셀 다운로드</button>
      </div>

      {/* PieChart 우측 상단 */}
      <div style={{ position: 'absolute', right: '2rem', top: '2rem', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
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
        'A+': '#FF0000',      // 빨강
        'A': '#FF6666',       // 연한빨강
        'B+': '#FFA500',      // 주황
        'B': '#FFD580',       // 연한주황
        'C+': '#66CC66',      // 노랑
        'C': '#CCFFCC',       // 연한노랑
        'D+': '#3399FF',      // 초록
        'D': '#ADD8E6',       // 연한초록
        'F': '#A9A9A9',       // 회색
      };
      return <Cell key={`cell-${index}`} fill={colorMap[entry.grade] || '#CCCCCC'} />;
    })}
  </Pie>
          <Tooltip />
        </PieChart>
      </div>

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
              <button onClick={handleApplyGradeRanges} style={{ marginRight: '1rem' }}>반영</button>
              <button onClick={() => setShowGradeModal(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}

      <table className="summary-table" style={{ marginTop: '8rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>단과대학</th>
            <th>학과</th>
            <th>학번</th>
            <th style={{ maxWidth: '100px' }}>이름</th>
            <th>비고</th>
            {isGradingMode ? (
              <th>등급</th>
            ) : (
              <>
                <th>결석 횟수</th>
                <th>출석(20)</th>
                <th>중간(40)</th>
                <th>기말(40)</th>
                <th>총점</th>
                <th>등급</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.studentId}>
              <td>{s.university}</td>
              <td>{s.department}</td>
              <td>{s.studentId}</td>
              <td style={{ maxWidth: '100px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{s.name}</td>
              <td style={{
                    width: "80px", // 원하는 너비로 조정 (ex. 60~100px 정도 추천)
                    textAlign: "center",
                    color: s.remarks?.includes("동명이인") ? "#E17100" : "inherit",
                    fontWeight: s.remarks?.includes("동명이인") ? "bold" : "normal",
                }}>{s.remarks}</td>
              {isGradingMode ? (
                <td>{s.grade ?? '-'}</td>
              ) : (
                <>
                  <td>{s.absentCount}</td>
                  <td>{s.attendanceScore ?? '-'}</td>
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
