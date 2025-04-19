package com.korea.attendance.model;

import lombok.Data;

@Data
public class StudentScoreDto {
    private String studentId;
    private String name;
    private String university;
    private String department;
    private String remarks;

    private Double score;
    private String penaltyReason;
    private String graderName;
}
