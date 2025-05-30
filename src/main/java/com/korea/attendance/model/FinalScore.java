package com.korea.attendance.model;

import lombok.Data;

@Data
public class FinalScore {
    private int classId;
    private String semester;
    private String studentId;
    private Double score;
    private String penaltyReason;
    private String graderName;
}
