package com.korea.attendance.repository;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.korea.attendance.model.Grader;

@Mapper
public interface GraderMapper {

	@Select("SELECT * FROM Grader WHERE semester = #{semester}")
	@Results({
	    @Result(property = "graderId", column = "grader_id"),
	    @Result(property = "semester", column = "semester"),
	    @Result(property = "graderName", column = "grader_name"),
	    @Result(property = "color", column = "color")
	})
	List<Grader> findBySemester(@Param("semester") String semester);


    @Insert("""
    	    INSERT INTO Grader (semester, grader_name, color)
    	    VALUES (#{grader.semester}, #{grader.graderName}, #{grader.color})
    	""")
    void insertGrader(@Param("grader") Grader grader);

    @Update("""
        UPDATE Grader
        SET grader_name = #{grader.graderName}, color = #{grader.color}
        WHERE grader_id = #{grader.graderId}
    """)
    void updateGrader(@Param("grader") Grader grader);

    @Delete("DELETE FROM Grader WHERE grader_id = #{graderId}")
    void deleteGrader(@Param("graderId") int graderId);
}

