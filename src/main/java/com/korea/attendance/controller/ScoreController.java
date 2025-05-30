package com.korea.attendance.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.korea.attendance.model.FinalScore;
import com.korea.attendance.model.Score;
import com.korea.attendance.model.StudentScoreDto;
import com.korea.attendance.repository.FinalScoreMapper;
import com.korea.attendance.repository.ScoreMapper;

@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    @Autowired
    private ScoreMapper scoreMapper;
    @Autowired
    private FinalScoreMapper finalScoreMapper;
    
    @GetMapping("/grades")
    public ResponseEntity<List<StudentScoreDto>> getScoresWithStudents(
        @RequestParam("classId") int classId, 
        @RequestParam("semester") String semester
    ) {
        return ResponseEntity.ok(scoreMapper.findScoresWithStudentInfo(classId, semester));
    }

    @PostMapping("/midterm")
    public ResponseEntity<Void> updateMidtermScore(@RequestBody Score dto) {
        scoreMapper.upsertMidtermScore(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/grader")
    public ResponseEntity<Void> upsertGraderOnly(@RequestBody List<Score> scores) {
        for (Score score : scores) {
            scoreMapper.upsertGraderOnly(score);
        }
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/midterm/bulk")
    public ResponseEntity<Void> updateMidtermScores(@RequestBody List<Score> scoreList) {
        for (Score dto : scoreList) {
            scoreMapper.upsertMidtermScore(dto);
        }
        return ResponseEntity.ok().build();
    }

    @GetMapping("/final")
    public ResponseEntity<List<StudentScoreDto>> getFinalScoresWithStudents(
        @RequestParam("classId") int classId, 
        @RequestParam("semester") String semester
    ) {
        return ResponseEntity.ok(finalScoreMapper.findFinalScoresWithStudentInfo(classId, semester));
    }

    @PostMapping("/final")
    public ResponseEntity<Void> updateFinalScore(@RequestBody FinalScore dto) {
        finalScoreMapper.upsertFinalScore(dto);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/final/bulk")
    public ResponseEntity<Void> updateFinalScores(@RequestBody List<FinalScore> scoreList) {
        for (FinalScore dto : scoreList) {
            finalScoreMapper.upsertFinalScore(dto);
        }
        return ResponseEntity.ok().build();
    }
    
 // 기말고사 채점자만 일괄 수정
    @PostMapping("/final/grader")
    public ResponseEntity<Void> updateFinalGraderName(@RequestBody List<FinalScore> list) {
        for (FinalScore s : list) {
            finalScoreMapper.updateFinalGraderNameOnly(s); // 👉 FinalScoreMapper에 새로 정의 필요
        }
        return ResponseEntity.ok().build();
    }
}
