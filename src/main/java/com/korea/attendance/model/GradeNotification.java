package com.korea.attendance.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data  // → @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor
@NoArgsConstructor  // Jackson이 필수로 요구하는 기본 생성자
@AllArgsConstructor
public class GradeNotification {
    private String classId;
    private String semester;
}
