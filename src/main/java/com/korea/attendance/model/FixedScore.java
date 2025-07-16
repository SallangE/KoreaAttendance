package com.korea.attendance.model;

import lombok.Data;

@Data
public class FixedScore {
    private int id;
    private String studentId;
    private int classId;
    private String semester;
    private String fixedGrade;
}
