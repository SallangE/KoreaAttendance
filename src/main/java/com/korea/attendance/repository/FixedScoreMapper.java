package com.korea.attendance.repository;

import com.korea.attendance.model.FixedScore;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface FixedScoreMapper {

    @Select("SELECT id, student_id, class_id, semester, fixed_grade FROM FixedScore WHERE class_id = #{classId} AND semester = #{semester}")
    List<FixedScore> findByClassIdAndSemester(@Param("classId") int classId, @Param("semester") String semester);

    @Insert("INSERT INTO FixedScore (student_id, class_id, semester, fixed_grade) " +
            "VALUES (#{studentId}, #{classId}, #{semester}, #{fixedGrade}) " +
            "ON DUPLICATE KEY UPDATE fixed_grade = #{fixedGrade}, updated_at = CURRENT_TIMESTAMP")
    void upsertFixedScore(FixedScore fixedScore);

    @Delete("DELETE FROM FixedScore WHERE student_id = #{studentId} AND class_id = #{classId} AND semester = #{semester}")
    void deleteFixedScore(FixedScore fixedScore);
}
