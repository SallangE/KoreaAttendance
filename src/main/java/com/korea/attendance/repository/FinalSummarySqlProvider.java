package com.korea.attendance.repository;

import org.apache.ibatis.jdbc.SQL;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class FinalSummarySqlProvider {

    public String buildFetchSummaryWithAttendance(Map<String, Object> params) {
        Integer classId = (Integer) params.get("classId");
        String semester = (String) params.get("semester");
        String startDate = (String) params.get("startDate");
        String endDate = (String) params.get("endDate");
        @SuppressWarnings("unchecked")
        List<Integer> dayOfWeeks = (List<Integer>) params.get("dayOfWeeks");

        // 요일 조건 조립
        String dayOfWeekCondition = "";
        if (dayOfWeeks != null && !dayOfWeeks.isEmpty()) {
            String dayIn = dayOfWeeks.stream().map(String::valueOf).collect(Collectors.joining(","));
            dayOfWeekCondition = "DAYOFWEEK(all_dates.generated_date) IN (" + dayIn + ")";
        }

        // WHERE 조립
        StringBuilder whereCondition = new StringBuilder("s2.class_id = " + classId);
        if (!dayOfWeekCondition.isEmpty()) {
            whereCondition.append(" AND ").append(dayOfWeekCondition);
        }

        // 출석 통계용 서브쿼리 문자열 구성
        String attendanceSubquery =
            "SELECT s2.student_id, s2.class_id, " +
            "       SUM(CASE WHEN a.student_id IS NULL THEN 1 ELSE 0 END) AS absent_count, " +
            "       CASE WHEN SUM(CASE WHEN a.student_id IS NULL THEN 1 ELSE 0 END) >= 7 THEN 0 ELSE 10 END AS attendance_score " +
            "FROM ( " +
            "   SELECT s2.student_id, all_dates.generated_date, s2.class_id " +
            "   FROM Student s2 " +
            "   JOIN ( " +
            "       SELECT ADDDATE('" + startDate + "', INTERVAL t4.i * 10 + t3.i DAY) AS generated_date " +
            "       FROM (SELECT 0 AS i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 " +
            "             UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t3, " +
            "            (SELECT 0 AS i UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 " +
            "             UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t4 " +
            "       WHERE ADDDATE('" + startDate + "', INTERVAL t4.i * 10 + t3.i DAY) <= '" + endDate + "' " +
            "   ) all_dates " +
            "   WHERE " + whereCondition.toString() +
            "     AND EXISTS (SELECT 1 FROM Attendance a2 WHERE a2.class_id = s2.class_id AND a2.date = all_dates.generated_date) " +
            "     AND NOT EXISTS (SELECT 1 FROM Attendance a3 WHERE a3.class_id = s2.class_id AND a3.student_id = s2.student_id AND a3.date = all_dates.generated_date AND a3.state IN ('present', 'late', 'excused')) " +
            ") s2 " +
            "LEFT JOIN Attendance a ON a.student_id = s2.student_id AND a.class_id = s2.class_id AND a.date = s2.generated_date " +
            "GROUP BY s2.student_id, s2.class_id";

        // SQL 객체 생성
        SQL sql = new SQL() {{
        	SELECT(
        			  "s.student_id, s.name, s.university, s.department, s.remarks, " + 
        			  "COALESCE(sc.score, 0) AS score, " +
        			  "COALESCE(fs.score, 0) AS finalScore, " +
        			  "COALESCE(a.attendance_score, 0) AS attendance_score, " +
        			  "COALESCE(a.absent_count, 0) AS absent_count"
        			);
            FROM("Student s");

            // 출석 통계 JOIN (서브쿼리 명시적 AS)
            LEFT_OUTER_JOIN("(" + attendanceSubquery + ") a ON s.student_id = a.student_id AND s.class_id = a.class_id");

            // 시험 점수 JOIN
            LEFT_OUTER_JOIN("Score sc ON s.student_id = sc.student_id AND sc.class_id = " + classId + " AND sc.semester = '" + semester + "'");
            LEFT_OUTER_JOIN("FinalScore fs ON s.student_id = fs.student_id AND fs.class_id = " + classId + " AND fs.semester = '" + semester + "'");

            WHERE("s.class_id = " + classId);
        }};

        // 디버깅용 출력
        System.out.println("🔍 [SQL LOG] Final Summary Query");
        System.out.println("📅 Range: " + startDate + " ~ " + endDate);
        System.out.println("📆 DayOfWeeks: " + dayOfWeeks);
        System.out.println("🧾 SQL:\n" + sql.toString());
        System.out.println("=====================================================");

        return sql.toString();
    }
}
