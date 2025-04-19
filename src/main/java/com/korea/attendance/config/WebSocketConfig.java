package com.korea.attendance.config;

//WebSocketConfig.java
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

 @Override
 public void registerStompEndpoints(StompEndpointRegistry registry) {
     registry.addEndpoint("/ws-grade")  // WebSocket 연결 엔드포인트
             .setAllowedOriginPatterns("*")  // CORS 허용
             .withSockJS();  // SockJS fallback 사용
 }

 @Override
 public void configureMessageBroker(MessageBrokerRegistry registry) {
     registry.enableSimpleBroker("/topic");  // 구독 주소 prefix
     registry.setApplicationDestinationPrefixes("/app"); // 클라이언트 전송 prefix
 }
}
