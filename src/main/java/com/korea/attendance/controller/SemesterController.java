package com.korea.attendance.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.korea.attendance.model.Semester;
import com.korea.attendance.repository.SemesterMapper;

@RestController
@RequestMapping("/api/semesters")
public class SemesterController {

    @Autowired
    private SemesterMapper semesterMapper;

    @GetMapping("/{classId}")
    public List<Semester> getSemesters(@PathVariable("classId") int classId) {
        return semesterMapper.findByClassId(classId);
    }

    @PostMapping
    public void addSemester(@RequestBody Map<String, Object> payload) {
        int classId = Integer.parseInt(payload.get("classId").toString());
        String semester = payload.get("semester").toString();
        semesterMapper.insertSemester(classId, semester);
    }
}
