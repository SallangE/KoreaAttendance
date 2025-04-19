package com.korea.attendance.repository;

import java.util.List;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.korea.attendance.model.Score;
import com.korea.attendance.model.StudentScoreDto;

@Mapper
public interface ScoreMapper {
	
	@Select("""
		    SELECT
		        s.student_id AS studentId,
		        s.name AS name,
		        s.university AS university,
		        s.department AS department,
		        s.remarks AS remarks,
		        sc.score AS score,
		        sc.penalty_reason AS penaltyReason,
		        sc.grader_name AS graderName
		    FROM Student s
		    LEFT JOIN Score sc
		      ON s.student_id = sc.student_id
		      AND sc.class_id = #{classId}
		      AND sc.semester = #{semester}
		    WHERE s.class_id = #{classId}
		    ORDER BY s.university, s.department, s.student_id
		""")
		List<StudentScoreDto> findScoresWithStudentInfo(
		    @Param("classId") int classId,
		    @Param("semester") String semester
		);

	@Insert("""
		    INSERT INTO Score (class_id, semester, student_id, score, penalty_reason, grader_name)
		    VALUES (#{classId}, #{semester}, #{studentId}, #{score}, #{penaltyReason}, #{graderName})
		    ON DUPLICATE KEY UPDATE
		      score = #{score},
		      penalty_reason = #{penaltyReason},
		      grader_name = #{graderName}
		""")
		void upsertMidtermScore(Score score);

	@Insert("""
		    INSERT INTO Score (class_id, semester, student_id, grader_name)
		    VALUES (#{classId}, #{semester}, #{studentId}, #{graderName})
		    ON DUPLICATE KEY UPDATE grader_name = #{graderName}
		""")
		void upsertGraderOnly(Score score);

}
