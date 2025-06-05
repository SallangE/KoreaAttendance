package com.korea.attendance.service;

import com.korea.attendance.model.FinalSummaryDTO;
import com.korea.attendance.repository.FinalSummaryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FinalSummaryService {

    @Autowired
    private FinalSummaryMapper finalSummaryMapper;

    public List<FinalSummaryDTO> getInitialSummary(int classId) {
        return finalSummaryMapper.fetchInitialSummary(classId);
    }

    public List<FinalSummaryDTO> getSummaryWithAttendance(int classId, String startDate, String endDate, List<Integer> dayOfWeeks, String semester) {
        return finalSummaryMapper.fetchSummaryWithAttendance(classId, startDate, endDate, dayOfWeeks, semester);
    }
}
