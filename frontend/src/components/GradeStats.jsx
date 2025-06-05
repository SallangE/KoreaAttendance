import { useEffect, useState } from "react";
import { fetchGradeWithStudents } from "../api/scoreApi";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

import ChartDataLabels from 'chartjs-plugin-datalabels';


ChartJS.register(
  ChartDataLabels,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  BarElement,
  CategoryScale,
  LinearScale
);

const pieOptions = {
    plugins: {
      datalabels: {
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce((acc, v) => acc + v, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        font: (context) => {
          const label = context.chart.data.labels[context.dataIndex];
          return {
            size: label === "기타" ? 10 : 40,
            weight: label === "기타" ? "normal" : "bold"
          };
        },
        color: "#000",
      },
      legend: {
        position: "bottom",
      },
    },
  };


// 단과대학 분류
const collegeCategories = {
  문과: ["문과대학"],
  이과: ["공과대학", "생명과학대학", "이과대학", "간호대학", "보건과학대학", "스마트보안학부","정보대학"],
  사회과학: ["경영대학", "정경대학", "국제대학", "미디어학부", "심리학부"],
};

// 학과 분류
const departmentCategories = {
  문과: [
    "국어국문학과", "노어노문학과", "독어독문학과", "불어불문학과", "사학과", "사회학과",
    "서어서문학과", "언어학과", "영어영문학과", "일어일문학과", "중어중문학과", "철학과",
    "한국사학과", "한문학과"
  ],
  이과: [
    "건축사회환경공학부", "건축학과", "기계공학부", "반도체공학과", "산업경영공학부", "신소재공학부",
    "전기전자공학부", "차세대통신학과", "화공생명공학과", "바이오의학공학부", "생명공학부","스마트보안학부",
    "생명과학부", "식품공학과", "환경생태공학부", "물리학과", "수학과", "지구환경과학과", "사이버국방학과",
    "화학과", "데이터과학과", "컴퓨터학과", "간호학과", "바이오시스템의과학부", "바이오의공학부", "보건환경융합과학부"
  ],
  사회과학: [
    "경영학과", "국제학부", "글로벌한국융합학부", "보건정책관리학부",
     "식품자원경제학과",
      "심리학부", "경제학과", "정치외교학과", "통계학과",
    "행정학과", "미디어학부"
  ]
};

// 색상 매핑
const categoryColors = {
  문과: "rgba(255, 99, 132, 0.7)",       // 빨강
  이과: "rgba(54, 162, 235, 0.7)",      // 파랑
  사회과학: "rgba(255, 159, 64, 0.7)", // 주황
  기타: "rgba(150, 150, 150, 0.7)",     // 회색
};

const GradeStats = ({ classId, semester }) => {
    const [students, setStudents] = useState([]);
  
    useEffect(() => {
      if (classId && semester) {
        fetchGradeWithStudents(classId, semester).then((data) => {
          const valid = data.filter((s) => s && s.studentId);
          setStudents(valid);
        });
      }
    }, [classId, semester]);
  
    const getCategoryCounts = (key, categoryMap) => {
      const result = { 문과: 0, 이과: 0, 사회과학: 0, 기타: 0 };
      const barCount = {}; // 막대그래프용
      const barColor = {};
  
      students.forEach((s) => {
        const value = s[key];
        let matched = false;
  
        for (const category in categoryMap) {
          if (categoryMap[category].includes(value)) {
            result[category]++;
            barColor[value] = categoryColors[category];
            matched = true;
            break;
          }
        }
  
        if (!matched) {
            result["기타"]++;
            barColor[value] = categoryColors["기타"];
          }
  
        barCount[value] = (barCount[value] || 0) + 1;
      });
  
      return { pie: result, bar: barCount, colorMap: barColor };
    };
  
    const makePieData = (counts, label) => {
        return {
          labels: Object.keys(counts),
          datasets: [
            {
              label,
              data: Object.values(counts), // ✅ 실제 수치 그대로 사용
              backgroundColor: Object.keys(counts).map((key) => {
                if (key === "기타") {
                  return "rgba(150, 150, 150, 0.5)"; // 기타는 조금 흐리게
                } else {
                  return categoryColors[key]; // 나머지는 강조
                }
              }),
              borderWidth: 1,
            },
          ],
        };
      };
      
  
    const makeBarData = (barCount, colorMap, label) => ({
      labels: Object.keys(barCount),
      datasets: [
        {
          label,
          data: Object.values(barCount),
          backgroundColor: Object.keys(barCount).map((k) => colorMap[k]),
        },
      ],
    });
  
    const barOptions = {
        responsive: true,
        plugins: {
          legend: { display: false },
          datalabels: { display: false }, 
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } },
          x: {
            ticks: {
              callback: (val, idx, ticks) => ticks[idx].label,
              maxRotation: 90,
              minRotation: 90,
            },
          },
        },
      };
      
  
    const college = getCategoryCounts("university", collegeCategories);
    const department = getCategoryCounts("department", departmentCategories);
  
    return (
      <div style={{ padding: "20px" }}>
        <h2>{semester} 통계</h2>
  
        {/* 파이차트 */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "40px", gap: "40px", flexWrap: "wrap" }}>
          <div style={{ width: "45%" }}>
            <h4>단과대학 분류 비율</h4>
            <Pie data={makePieData(college.pie, "단과대학 분류 비율")} options={pieOptions} />
          </div>
        </div>
  
        {/* 막대그래프 */}
        <div style={{ marginBottom: "40px" }}>
          <h3>단과대학별 수강생 수</h3>
          <Bar data={makeBarData(college.bar, college.colorMap, "단과대학별 수강생 수")} options={barOptions} />
        </div>
  
        <div>
          <h3>학과별 수강생 수</h3>
          <Bar data={makeBarData(department.bar, department.colorMap, "학과별 수강생 수")} options={barOptions} />
        </div>
      </div>
    );
  };
  
  export default GradeStats;
  