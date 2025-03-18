package com.korea.attendance.service;

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
        return attendanceMapper.findAttendanceByClassAndDate(classId, date);
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

        // ✅ 현재 KST 시간 가져오기
        ZoneId KST = ZoneId.of("Asia/Seoul");
        LocalTime currentTime = LocalTime.now(KST);
        System.out.println("✅ 현재 KST 시간: " + currentTime);

        // ✅ 기존의 DB에서 출석 가능 여부를 확인하는 부분을 제거하고, 직접 시간 비교
        ClassSettings classSettings = classMapper.getClassSettings(request.getClassId()); // 기존 DB 조회 로직 유지
        if (classSettings == null) {
            response.put("message", "❌ 출석 가능 시간 정보를 찾을 수 없습니다.");
            response.put("state", "none");
            return response;
        }
        
        // ✅ 출석 가능 시간 가져오기
        LocalTime presentStart = LocalTime.parse(classSettings.getPresentStart(), DateTimeFormatter.ofPattern("HH:mm:ss"));
        LocalTime lateEnd = LocalTime.parse(classSettings.getLateEnd(), DateTimeFormatter.ofPattern("HH:mm:ss"));

        // ✅ 출석 가능 여부 확인 (이전에는 DB에서 했던 부분을 백엔드에서 직접 판단)
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

        // ✅ 기존 출석 확인
        int count = attendanceMapper.checkExistingAttendance(request.getStudentId(), request.getClassId(), request.getDate());
        if (count > 0) {
            Attendance existingAttendance = attendanceMapper.getAttendanceByStudentAndDate(request.getStudentId(), request.getClassId(), request.getDate());
            response.put("message", "❗ 이미 출석이 기록되었습니다.");
            response.put("state", existingAttendance.getState());
            return response;
        }

        // ✅ 정상 출석 기록
        attendanceMapper.studentCheckIn(request);
        // ✅ 새로 만든 쿼리로 안전하게 조회 (학생정보 JOIN 안함)
        Attendance newAttendance = attendanceMapper.getSimpleAttendanceByStudentAndDate(
                request.getStudentId(), request.getClassId(), request.getDate());

        response.put("message", "✅ 출결 상태가 기록되었습니다.");
        response.put("state", newAttendance.getState());
        return response;
    }

}
