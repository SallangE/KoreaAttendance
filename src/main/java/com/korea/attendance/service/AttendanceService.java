package com.korea.attendance.service;

import com.korea.attendance.model.Attendance;

import java.util.List;
import java.util.Map;

public interface AttendanceService {

    List<Attendance> getAttendanceByClassAndDate(int classId, String date); // ✅ 특정 날짜 출석 데이터 조회

    void updateAttendanceState(int attendanceId, String state); // ✅ 출석 상태 변경

    void updateAttendanceReason(int attendanceId, String reason); // ✅ 출석 사유 변경

    void addAttendance(Attendance attendance); // ✅ 출석 기록 추가

    void deleteAttendance(int attendanceId); // ✅ 출석 기록 삭제
    
    Map<String, Object> studentCheckIn(Attendance request); // 학생 출석 기록
}
