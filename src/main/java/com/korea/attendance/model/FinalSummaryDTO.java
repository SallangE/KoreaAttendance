package com.korea.attendance.model;

import lombok.Data;

@Data
public class FinalSummaryDTO {
    private String studentId;
    private String name;
    private String university;
    private String department;
    private String remarks;
    private Double score; // 중간고사
    private Double finalScore; // 기말고사
    private Double attendanceScore; // 출석점수
    private Integer absentCount; // 결석횟수
}