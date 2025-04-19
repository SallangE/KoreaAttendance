package com.korea.attendance.model;

import lombok.Data;
import java.sql.Timestamp;

@Data
public class Semester {
    private int semesterId;
    private int classId;
    private String semester;
    private Timestamp createdAt;
}