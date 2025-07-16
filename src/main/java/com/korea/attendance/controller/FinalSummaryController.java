package com.korea.attendance.controller;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.korea.attendance.model.FinalSummaryDTO;
import com.korea.attendance.model.FixedScore;
import com.korea.attendance.service.FinalSummaryService;
import com.korea.attendance.service.FixedScoreService;

@RestController
@RequestMapping("/api/final-summary")
public class FinalSummaryController {

    @Autowired
    private FinalSummaryService finalSummaryService;
    @Autowired
    private FixedScoreService fixedScoreService;

    // 초기 렌더링용 (출석 점수 제외)
    @GetMapping("/basic")
    public List<FinalSummaryDTO> getInitialSummary(@RequestParam("classId") int classId) {
        return finalSummaryService.getInitialSummary(classId);
    }

    // 출석 점수 포함된 요약
    @GetMapping
    public List<FinalSummaryDTO> getFinalSummaryWithAttendance(
        @RequestParam("classId") int classId,
        @RequestParam("startDate") String startDate,
        @RequestParam("endDate") String endDate,
        @RequestParam("days") String days, // "2,4,6" 형식으로 전달됨
        @RequestParam("semester") String semester
    ) {
        List<Integer> dayOfWeeks = Arrays.stream(days.split(","))
                                         .map(String::trim)
                                         .filter(s -> !s.isEmpty())
                                         .map(Integer::parseInt)
                                         .collect(Collectors.toList());

        return finalSummaryService.getSummaryWithAttendance(classId, startDate, endDate, dayOfWeeks, semester);
    }
    
    // 고정 점수 불러오기
    @GetMapping("/fixed-scores")
    public List<FixedScore> getFixedScores(@RequestParam("classId") int classId,
                                           @RequestParam("semester") String semester) {
        return fixedScoreService.getFixedScores(classId, semester);
    }

    // [추가] 고정 점수 저장 or 업데이트
    @PostMapping("/fixed-scores")
    public ResponseEntity<?> upsertFixedScore(@RequestBody FixedScore fixedScore) {
        fixedScoreService.upsertFixedScore(fixedScore);
        return ResponseEntity.ok().build();
    }
}
