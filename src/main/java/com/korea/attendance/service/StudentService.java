package com.korea.attendance.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.korea.attendance.model.Student;
import com.korea.attendance.repository.StudentMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentMapper studentMapper;

    // ✅ 수강생 등록
    public void registerStudent(Student newStudent) {
        studentMapper.registerStudent(newStudent);
    }

    // ✅ 특정 강의실의 모든 학생 조회
    public List<Student> getStudentsByClass(int classId) {
        return studentMapper.findStudentsByClass(classId);
    }

    // ✅ 학생 데이터 수정 (매개변수 매칭 수정)
    public void updateStudent(String studentId, Student updatedStudent) {
        studentMapper.updateStudent(
            studentId,
            updatedStudent.getUniversity(),
            updatedStudent.getDepartment(),
            updatedStudent.getName(),
            updatedStudent.getEmail(),
            updatedStudent.getClassId(),
            updatedStudent.getRemarks() // ✅ remarks 추가
        );
    }

    // ✅ 수강생 삭제
    public void deleteStudent(String studentId) {
        studentMapper.deleteStudent(studentId);
    }
}
