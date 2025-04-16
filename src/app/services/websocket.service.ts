import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private stompClient: any;

  connect(user: any, onMessage: (msg: any) => void) {
    const socket = new SockJS('/ws');
    this.stompClient = Stomp.over(socket);
    this.stompClient.connect({}, () => {
      if (user.type === 'CLIENT') {
        // Le client s'abonne à son propre canal //
        const destination = `/topic/messages/${user.username}`;
        this.stompClient.subscribe(destination, (msg: any) => onMessage(JSON.parse(msg.body)));
      } else {
        // Le support s'abonne à tout //
        this.stompClient.subscribe('/topic/messages/SUPPORT', (msg: any) => onMessage(JSON.parse(msg.body)));
      }
    });
  }

  sendMessage(message: any) {
    this.stompClient.send('/app/chat', {}, JSON.stringify(message));
  }
}
