package com.korea.attendance.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.korea.attendance.model.Grader;
import com.korea.attendance.repository.GraderMapper;

@RestController
@RequestMapping("/api/graders")
public class GraderController {

    @Autowired
    private GraderMapper graderMapper;

    @GetMapping
    public List<Grader> getGraders(@RequestParam("semester") String semester) {
        return graderMapper.findBySemester(semester);
    }

    @PostMapping("/add")
    public ResponseEntity<Void> addGrader(@RequestBody Grader grader) {
        graderMapper.insertGrader(grader);
        return ResponseEntity.ok().build();
    }

    @PutMapping
    public void updateGrader(@RequestBody Grader grader) {
        graderMapper.updateGrader(grader);
    }

    @DeleteMapping("/{graderId}")
    public void deleteGrader(@PathVariable("graderId") int graderId) {
        graderMapper.deleteGrader(graderId);
    }
}
