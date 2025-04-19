package com.korea.attendance.model;

import lombok.Data;

import java.util.List;

@Data
public class GraderUpdateRequest {
    private int classId;
    private String semester;
    private String graderName;
    private List<String> studentIds;
}
