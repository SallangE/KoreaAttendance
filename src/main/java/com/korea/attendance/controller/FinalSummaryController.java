package com.korea.attendance.controller;

import com.korea.attendance.model.FinalSummaryDTO;
import com.korea.attendance.service.FinalSummaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/final-summary")
public class FinalSummaryController {

    @Autowired
    private FinalSummaryService finalSummaryService;

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
}
