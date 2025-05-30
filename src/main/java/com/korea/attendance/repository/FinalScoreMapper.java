package com.korea.attendance.repository;

import java.util.List;
import org.apache.ibatis.annotations.*;
import com.korea.attendance.model.FinalScore;
import com.korea.attendance.model.StudentScoreDto;

@Mapper
public interface FinalScoreMapper {

    @Select("""
        SELECT
            s.student_id AS studentId,
            s.name AS name,
            s.university AS university,
            s.department AS department,
            s.remarks AS remarks,
            fs.score AS score,
            fs.penalty_reason AS penaltyReason,
            fs.grader_name AS graderName
        FROM Student s
        LEFT JOIN FinalScore fs
          ON s.student_id = fs.student_id
          AND fs.class_id = #{classId}
          AND fs.semester = #{semester}
        WHERE s.class_id = #{classId}
        ORDER BY s.university, s.department, s.student_id
    """)
    List<StudentScoreDto> findFinalScoresWithStudentInfo(
        @Param("classId") int classId,
        @Param("semester") String semester
    );

    @Insert("""
        INSERT INTO FinalScore (class_id, semester, student_id, score, penalty_reason, grader_name)
        VALUES (#{classId}, #{semester}, #{studentId}, #{score}, #{penaltyReason}, #{graderName})
        ON DUPLICATE KEY UPDATE
          score = #{score},
          penalty_reason = #{penaltyReason},
          grader_name = #{graderName}
    """)
    void upsertFinalScore(FinalScore score);
    
    @Update("""
    	    UPDATE FinalScore
    	    SET grader_name = #{graderName}
    	    WHERE student_id = #{studentId}
    	      AND class_id = #{classId}
    	      AND semester = #{semester}
    	""")
    	void updateFinalGraderNameOnly(FinalScore score);
}
