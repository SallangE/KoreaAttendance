package com.korea.attendance.repository;

import com.korea.attendance.model.FinalSummaryDTO;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface FinalSummaryMapper {

    // 🔹 초기 렌더링 (출석 점수 제외)
    @Select("""
        SELECT
            s.student_id,
            s.name,
            s.university,
            s.department,
            s.remarks,
            IFNULL(sc.score, 0) AS score,
            IFNULL(fs.score, 0) AS finalScore,
            0 AS attendance_score,
            0 AS absent_count
        FROM Student s
        LEFT JOIN Score sc ON s.student_id = sc.student_id AND sc.class_id = #{classId}
        LEFT JOIN FinalScore fs ON s.student_id = fs.student_id AND fs.class_id = #{classId}
        WHERE s.class_id = #{classId}
    """)
    @Results({
        @Result(property = "studentId", column = "student_id"),
        @Result(property = "name", column = "name"),
        @Result(property = "university", column = "university"),
        @Result(property = "department", column = "department"),
        @Result(property = "score", column = "score"),
        @Result(property = "finalScore", column = "finalScore"),
        @Result(property = "attendanceScore", column = "attendance_score"),
        @Result(property = "absentCount", column = "absent_count"),
        @Result(property = "remarks", column = "remarks")
    })
    List<FinalSummaryDTO> fetchInitialSummary(@Param("classId") int classId);

    // 🔹 출석 점수 반영
    @SelectProvider(type = FinalSummarySqlProvider.class, method = "buildFetchSummaryWithAttendance")
    @Results({
        @Result(property = "studentId", column = "student_id"),
        @Result(property = "name", column = "name"),
        @Result(property = "university", column = "university"),
        @Result(property = "department", column = "department"),
        @Result(property = "score", column = "score"),
        @Result(property = "finalScore", column = "finalScore"),
        @Result(property = "attendanceScore", column = "attendance_score"),
        @Result(property = "absentCount", column = "absent_count")
    })
    List<FinalSummaryDTO> fetchSummaryWithAttendance(
        @Param("classId") int classId,
        @Param("startDate") String startDate,
        @Param("endDate") String endDate,
        @Param("dayOfWeeks") List<Integer> dayOfWeeks,
        @Param("semester") String semester
    );
}
