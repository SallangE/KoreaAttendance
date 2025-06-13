package com.korea.attendance.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.korea.attendance.model.Student;
import com.korea.attendance.service.StudentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    // ✅ 수강생 등록
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody Student newStudent) {
        studentService.registerStudent(newStudent);
        return ResponseEntity.ok("수강생 등록 완료");
    }

    // ✅ 특정 강의실의 모든 학생 조회
    @GetMapping("/class/{classId}")  //  `{}` 중괄호로 감싸서 명확하게 지정
    public ResponseEntity<List<Student>> getStudentsByClass(@PathVariable("classId") int classId) {
        List<Student> students = studentService.getStudentsByClass(classId);
        return ResponseEntity.ok(students);
    }
    
    @PutMapping("/{studentId}")
    public ResponseEntity<?> updateStudent(
            @PathVariable("studentId") String studentId,
            @RequestBody Student updatedStudent) {
        studentService.updateStudent(studentId, updatedStudent);
        return ResponseEntity.ok("수강생 정보 업데이트 성공");
    }
    
    // 수강생 삭제
    @DeleteMapping("/{studentId}")
    public ResponseEntity<?> deleteStudent(@PathVariable("studentId") String studentId) {
        studentService.deleteStudent(studentId);
        return ResponseEntity.ok("수강생 삭제 완료");
    }
    
    //엑셀로 학생 명단 주입
    @PostMapping("/upload/{classId}")
    public ResponseEntity<?> uploadStudentExcel(
    		@PathVariable("classId") int classId,
    	    @RequestParam("file") MultipartFile file
    ) {
        studentService.importStudentsFromExcel(file, classId);
        return ResponseEntity.ok("엑셀 업로드 완료");
    }
}
