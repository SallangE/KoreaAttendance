import { useState } from "react";
import axios from "axios";

const SortgsPage = () => {
  const [query, setQuery] = useState("");
  const [nresults, setNresults] = useState(100);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ 추가

  const handleSearch = async () => {
    if (!query.trim()) return alert("검색어를 입력하세요.");
    setLoading(true); // ✅ 시작
    setResults([]);
    try {
      const res = await axios.get("http://localhost:8080/api/sortgs", {
        params: { query, nresults },
      });
      setResults(res.data);
    } catch (err) {
      alert("❌ 검색 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false); // ✅ 종료
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>📚 논문 검색 도구 (sortgs)</h2>
      <div style={{ marginBottom: "1rem" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어 입력"
          style={{ width: "300px", marginRight: "1rem" }}
        />
        <input
          type="number"
          value={nresults}
          onChange={(e) => setNresults(Number(e.target.value))}
          placeholder="검색 개수"
          style={{ width: "120px", marginRight: "1rem" }}
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      {/* ✅ 로딩 메시지 표시 */}
      {loading && <p style={{ fontWeight: "bold", color: "#555" }}>🔍 검색 중입니다. 잠시만 기다려주세요...</p>}

      {results.length > 0 && (
        <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>순위</th>
              <th>제목</th>
              <th>저자</th>
              <th>피인용수</th>
              <th>년도</th>
              <th>출판사</th>
              <th>분야</th>
              <th>연간 피인용수</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <a href={row.Source} target="_blank" rel="noopener noreferrer">
                    {row.Title}
                  </a>
                </td>
                <td>{row.Author}</td>
                <td>{row.Citations}</td>
                <td>{row.Year}</td>
                <td>{row.Publisher}</td>
                <td>{row.Venue}</td>
                <td>{row["cit/year"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SortgsPage;
