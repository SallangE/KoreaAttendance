package com.korea.attendance.controller;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private TestService testService;

    // DB 연결 확인 API
    @GetMapping("/db")
    public ResponseEntity<String> testDbConnection() {
        try {
            long count = testService.getStudentCount();  // 서비스에서 학생 수 조회
            return ResponseEntity.ok("DB 연결 성공, 학생 수: " + count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("DB 연결 실패: " + e.getMessage());
        }
    }
}
