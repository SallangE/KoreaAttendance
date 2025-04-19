package com.korea.attendance.repository;

import java.util.List;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import com.korea.attendance.model.Semester;

@Mapper
public interface SemesterMapper {

    @Select("SELECT * FROM Semester WHERE class_id = #{classId} ORDER BY created_at ASC")
    List<Semester> findByClassId(@Param("classId") int classId);

    @Insert("INSERT INTO Semester (class_id, semester) VALUES (#{classId}, #{semester})")
    void insertSemester(@Param("classId") int classId, @Param("semester") String semester);}