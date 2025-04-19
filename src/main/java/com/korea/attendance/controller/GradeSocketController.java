package com.korea.attendance.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import com.korea.attendance.model.GradeNotification;

@Controller
public class GradeSocketController {

    @MessageMapping("/grade/update")  // 클라이언트가 보낼 주소
    @SendTo("/topic/grade-updates")   // 프론트가 구독할 주소와 일치시킴
    public GradeNotification broadcastGrade(GradeNotification message) {
    	System.out.println("📥 받은 WebSocket 메시지: " + message);
    	return message;
    }
}
