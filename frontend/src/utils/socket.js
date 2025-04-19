import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

const socketUrl = "https://korea-attendance-96b0a03da0c9.herokuapp.com/ws-grade";

let stompClient = null;

// WebSocket 연결 함수
const connectWebSocket = (onMessageCallback) => {
  const socket = new SockJS(socketUrl);

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

    onConnect: () => {
      console.log("✅ WebSocket connected");

      if (!stompClient || !stompClient.connected) {
        console.warn("⛔️ STOMP 연결이 아직 준비되지 않았습니다.");
        return;
      }

      try {
        stompClient.subscribe("/topic/grade-updates", (message) => {
          try {
            const body = JSON.parse(message.body);
            console.log("📩 받은 메시지:", body);
            onMessageCallback(body);
          } catch (err) {
            console.error("❌ WebSocket 메시지 파싱 오류:", err);
          }
        });

        console.log("📡 WebSocket 구독 성공");
      } catch (err) {
        console.error("❌ 구독 중 오류 발생:", err);
      }
    },

    onStompError: (frame) => {
      console.error("🔴 STOMP 오류:", frame);
    },

    debug: (msg) => {
      // console.log("📦 DEBUG:", msg);
    },
  });

  stompClient.activate();
};

// 메시지 전송 함수
const sendGradeUpdate = (gradeInfo) => {
  if (stompClient && stompClient.connected) {
    console.log("📤 메시지 전송", gradeInfo);
    stompClient.publish({
      destination: "/app/grade/update",
      body: JSON.stringify(gradeInfo),
    });
  } else {
    console.warn("⛔️ WebSocket이 아직 연결되지 않았습니다.");
  }
};

export { connectWebSocket, sendGradeUpdate };
