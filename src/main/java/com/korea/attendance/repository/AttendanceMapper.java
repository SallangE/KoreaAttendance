package com.korea.attendance.repository;

import com.korea.attendance.model.Attendance;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface AttendanceMapper {

	// ✅ 현재 출석 가능 여부 확인 (DB에서 직접 체크)
    @Select("""
        SELECT CASE 
            WHEN NOW() < present_start THEN 'early'
            WHEN NOW() > end_time THEN 'late'
            ELSE 'valid'
        END AS check_result
        FROM Class
        WHERE class_id = #{classId}
    """)
    String checkAttendanceAvailability(@Param("classId") int classId);
	
	// 중복 체크 로직
	@Select("""
		    SELECT COUNT(*) FROM Attendance 
		    WHERE student_id = #{studentId} 
		      AND class_id = #{classId} 
		      AND date = #{date}
		""")
		int checkExistingAttendance(@Param("studentId") String studentId, @Param("classId") int classId, @Param("date") String date);

	// ✅ 학생 출석 시도 (Attendance 객체를 받아 처리) - CURDATE() 적용 버전
	@Insert("""
		    INSERT INTO Attendance (student_id, class_id, date, state, created_at, updated_at)
		    SELECT 
		        #{studentId}, 
		        #{classId}, 
		        DATE(CONVERT_TZ(NOW(), 'UTC', 'Asia/Seoul')), 
		        CASE 
		            WHEN TIME(CONVERT_TZ(NOW(), 'UTC', 'Asia/Seoul')) BETWEEN c.present_start AND c.present_end THEN 'present'
		            WHEN TIME(CONVERT_TZ(NOW(), 'UTC', 'Asia/Seoul')) BETWEEN c.present_end AND c.late_end THEN 'late'
		            ELSE 'absent' 
		        END,
		        DATE_FORMAT(CONVERT_TZ(NOW(), 'UTC', 'Asia/Seoul'), '%Y-%m-%d %H:%i:%s'),
		        NULL
		    FROM Class c
		    WHERE c.class_id = #{classId} 
		      AND NOT EXISTS (
		        SELECT 1 FROM Attendance 
		        WHERE student_id = #{studentId} 
		          AND class_id = #{classId} 
		          AND date = DATE(CONVERT_TZ(NOW(), 'UTC', 'Asia/Seoul'))
		    )
		""")
		@Options(useGeneratedKeys = true, keyProperty = "attendanceId")
		void studentCheckIn(Attendance attendance);


    @Select("""
    	    SELECT 
    	        COALESCE(a.attendance_id, 0) AS attendance_id, 
    	        s.student_id AS student_id, 
    	        s.name AS name, 
    	        s.university AS university,   
    	        s.department AS department,   
    	        s.class_id AS class_id, 
    	        c.class_name AS class_name, 
    	        COALESCE(DATE_FORMAT(a.date, '%Y-%m-%d'), #{date}) AS date,
    	        COALESCE(a.state, 'absent') AS state, 
    	        COALESCE(a.reason, '미등록') AS reason, 
    	        COALESCE(s.remarks, '') AS remarks,  
    	        COALESCE(a.created_at, NULL) AS created_at, 
    	        COALESCE(a.updated_at, NULL) AS updated_at
    	    FROM Student s
    	    LEFT JOIN Attendance a 
    	        ON s.student_id = a.student_id 
    	        AND a.class_id = #{classId} 
    	        AND DATE(a.date) = #{date}
    	    LEFT JOIN Class c 
    	        ON s.class_id = c.class_id
    	    WHERE s.class_id = #{classId}
    	""")
    	@Results(id = "AttendanceResultMap", value = {
    	    @Result(column = "attendance_id", property = "attendanceId"),
    	    @Result(column = "student_id", property = "studentId"),
    	    @Result(column = "name", property = "name"),
    	    @Result(column = "university", property = "university"),
    	    @Result(column = "department", property = "department"),
    	    @Result(column = "class_id", property = "classId"),
    	    @Result(column = "class_name", property = "className"),
    	    @Result(column = "date", property = "date"),
    	    @Result(column = "state", property = "state"),
    	    @Result(column = "reason", property = "reason"),
    	    @Result(column = "remarks", property = "remarks"), // ✅ Student 테이블에서 remarks 가져옴 (읽기 전용)
    	    @Result(column = "created_at", property = "createdAt"),
    	    @Result(column = "updated_at", property = "updatedAt")
    	})
    	List<Attendance> findAttendanceByClassAndDate(@Param("classId") int classId, @Param("date") String date);

	@Insert("""
		    INSERT INTO Attendance (student_id, class_id, date, state, created_at, updated_at)
		    SELECT #{studentId}, #{classId}, #{date}, #{state}, NOW(), NOW()
		    FROM DUAL
		    WHERE NOT EXISTS (
		        SELECT 1 FROM Attendance 
		        WHERE student_id = #{studentId} 
		          AND class_id = #{classId} 
		          AND date = #{date}
		    )
		""")
		void insertAttendance(@Param("studentId") String studentId, @Param("classId") int classId, @Param("date") String date, @Param("state") String state);

    @Update("""
    	    UPDATE Attendance 
    	    SET state = #{state}, updated_at = NOW()
    	    WHERE attendance_id = #{attendanceId}
    	""")
    	void updateAttendanceState(@Param("attendanceId") int attendanceId, @Param("state") String state);

    	@Update("""
    	    UPDATE Attendance 
    	    SET reason = #{reason}, updated_at = NOW()
    	    WHERE attendance_id = #{attendanceId}
    	""")
    	void updateAttendanceReason(@Param("attendanceId") int attendanceId, @Param("reason") String reason);

    @Delete("""
        DELETE FROM Attendance WHERE attendance_id = #{attendanceId}
    """)
    void deleteAttendance(@Param("attendanceId") int attendanceId);

    @Select("""
        SELECT COUNT(*) FROM Attendance 
        WHERE student_id = #{studentId} AND class_id = #{classId} AND date = #{date}
    """)
    int checkDuplicateAttendance(@Param("studentId") String studentId, @Param("classId") int classId, @Param("date") String date);

 // ✅ 출석 기록 조회
    @Select("""
    	    SELECT attendance_id, student_id, class_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, state, created_at, updated_at
    	    FROM Attendance 
    	    WHERE student_id = #{studentId} 
    	      AND class_id = #{classId} 
    	      AND date = #{date}
    	""")
    	Attendance getAttendanceByStudentAndDate(
    	    @Param("studentId") String studentId, 
    	    @Param("classId") int classId, 
    	    @Param("date") String date
    	);
    
    // ✅ 새로 추가된 핵심 메서드 (JOIN 없이 순수 Attendance 조회)
    @Select("SELECT attendance_id, student_id, class_id, DATE_FORMAT(date, '%Y-%m-%d') AS date, state, created_at, updated_at " +
            "FROM Attendance " +
            "WHERE student_id = #{studentId} AND class_id = #{classId} AND date = #{date}")
    Attendance getSimpleAttendanceByStudentAndDate(@Param("studentId") String studentId,
                                                   @Param("classId") int classId,
                                                   @Param("date") String date);

}
