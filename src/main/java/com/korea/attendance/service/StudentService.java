package com.korea.attendance.service;

import java.util.List;

import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    
 // 엑셀 주입 메서드
    public void importStudentsFromExcel(MultipartFile file, int classId) {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // A열은 번호 (무시)
                String university = getCellValue(row.getCell(1)); // B
                String department = getCellValue(row.getCell(2)); // C
                String studentId = getCellValue(row.getCell(3));  // D
                String name = getCellValue(row.getCell(4));       // E
                String remarks = getCellValue(row.getCell(5));    // F

                if (studentId == null || studentId.trim().isEmpty()) continue;

                // ✅ 중복 학번+강의실 조합이 없을 때만 삽입
                if (!studentMapper.existsByStudentIdAndClassId(studentId, classId)) {
                    Student student = Student.builder()
                            .studentId(studentId)
                            .university(university)
                            .department(department)
                            .name(name)
                            .email("") // 현재는 공백
                            .remarks(remarks)
                            .classId(classId)
                            .build();

                    studentMapper.insertStudent(student);
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("엑셀 업로드 실패", e);
        }
    }

    // 셀 값 추출 유틸 메서드
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            default -> "";
        };
    }

}
