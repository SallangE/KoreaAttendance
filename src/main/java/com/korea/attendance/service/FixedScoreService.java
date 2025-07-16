package com.korea.attendance.service;

import com.korea.attendance.model.FixedScore;
import com.korea.attendance.repository.FixedScoreMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FixedScoreService {

    @Autowired
    private FixedScoreMapper fixedScoreMapper;

    public List<FixedScore> getFixedScores(int classId, String semester) {
        return fixedScoreMapper.findByClassIdAndSemester(classId, semester);
    }

    public void upsertFixedScore(FixedScore fixedScore) {
        if (fixedScore.getFixedGrade() == null || fixedScore.getFixedGrade().isEmpty()) {
            fixedScoreMapper.deleteFixedScore(fixedScore);
        } else {
            fixedScoreMapper.upsertFixedScore(fixedScore);
        }
    }
}
