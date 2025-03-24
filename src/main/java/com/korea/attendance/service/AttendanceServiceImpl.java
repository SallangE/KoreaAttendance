package com.korea.attendance.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.korea.attendance.model.Attendance;
import com.korea.attendance.model.ClassSettings;
import com.korea.attendance.repository.AttendanceMapper;
import com.korea.attendance.repository.ClassMapper;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceMapper attendanceMapper;
    private final ClassMapper classMapper;

    public AttendanceServiceImpl(AttendanceMapper attendanceMapper, ClassMapper classMapper) {
        this.attendanceMapper = attendanceMapper;
        this.classMapper = classMapper;
    }

    // ✅ 특정 날짜 출석 데이터 조회
    @Override
    public List<Attendance> getAttendanceByClassAndDate(int classId, String date) {
    List<Attendance> attendanceList = attendanceMapper.findAttendanceByClassAndDate(classId, date);
    for (Attendance att : attendanceList) {
        if (att.getCreatedAt() == null) att.setCreatedAt("");
        if (att.getUpdatedAt() == null) att.setUpdatedAt("");
    }
    return attendanceList;
}


    // ✅ 출석 상태 변경
    @Override
    @Transactional
    public void updateAttendanceState(int attendanceId, String state) {
        attendanceMapper.updateAttendanceState(attendanceId, state);
    }

    // ✅ 출석 사유 변경
    @Override
    @Transactional
    public void updateAttendanceReason(int attendanceId, String reason) {
        attendanceMapper.updateAttendanceReason(attendanceId, reason);
    }

    // ✅ 출석 기록 추가 (중복 검사)
    @Override
    @Transactional
    public void addAttendance(Attendance attendance) {
        int existingCount = attendanceMapper.checkDuplicateAttendance(
                attendance.getStudentId(), attendance.getClassId(), attendance.getDate());

        if (existingCount == 0) { // 기존 기록이 없는 경우만 추가
            attendanceMapper.insertAttendance(
                    attendance.getStudentId(),
                    attendance.getClassId(),
                    attendance.getDate(),
                    attendance.getState());
        }
    }

    // ✅ 출석 기록 삭제
    @Override
    @Transactional
    public void deleteAttendance(int attendanceId) {
        attendanceMapper.deleteAttendance(attendanceId);
    }
    
    //학생 출석 기록
 // 출석 기록 반환 메서드 수정
    @Override
    @Transactional
    public Map<String, Object> studentCheckIn(Attendance request) {
        Map<String, Object> response = new HashMap<>();

        // ✅ 서버에서 오늘 날짜 직접 찍기 (KST 기준)
        String today = LocalDate.now(ZoneId.of("Asia/Seoul")).toString();

        // ✅ 시간 체크 로직 그대로
        ZoneId KST = ZoneId.of("Asia/Seoul");
        LocalTime currentTime = LocalTime.now(KST);
        ClassSettings classSettings = classMapper.getClassSettings(request.getClassId());

        if (classSettings == null) {
            response.put("message", "❌ 출석 가능 시간 정보를 찾을 수 없습니다.");
            response.put("state", "none");
            return response;
        }

        LocalTime presentStart = LocalTime.parse(classSettings.getPresentStart(), DateTimeFormatter.ofPattern("HH:mm:ss"));
        LocalTime lateEnd = LocalTime.parse(classSettings.getLateEnd(), DateTimeFormatter.ofPattern("HH:mm:ss"));

        if (currentTime.isBefore(presentStart)) {
            response.put("message", "❌ 아직 출석 가능한 시간이 아닙니다.");
            response.put("state", "none");
            return response;
        }
        if (currentTime.isAfter(lateEnd)) {
            response.put("message", "❌ 수업이 종료된 이후에는 출석할 수 없습니다.");
            response.put("state", "none");
            return response;
        }

        // ✅ 중복 체크도 서버 today로
        int count = attendanceMapper.checkExistingAttendance(request.getStudentId(), request.getClassId(), today);
        if (count > 0) {
            Attendance existingAttendance = attendanceMapper.getSimpleAttendanceByStudentAndDate(
                    request.getStudentId(), request.getClassId(), today);
            response.put("message", "❗ 이미 출석이 기록되었습니다.");
            response.put("state", existingAttendance.getState());
            return response;
        }

        // ✅ Attendance 객체에 date 세팅 후 출석 기록
        request.setDate(today);
        attendanceMapper.studentCheckIn(request);

        // ✅ 저장 후 조회도 서버 today로
        Attendance newAttendance = attendanceMapper.getSimpleAttendanceByStudentAndDate(
                request.getStudentId(), request.getClassId(), today);

        if (newAttendance == null) {
            throw new RuntimeException("출석 기록이 저장되지 않았습니다. 관리자에게 문의하세요.");
        }

        response.put("message", "✅ 출결 상태가 기록되었습니다.");
        response.put("state", newAttendance.getState());
        return response;
    }
}
