import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})

export class WebsocketService {

  stompClient: Client | null = null; 

  private readonly messageSubject = new BehaviorSubject<any>(null);
  public messages$ = this.messageSubject.asObservable();  

  private readonly connectionSubject = new BehaviorSubject<boolean>(false);
  public connectionStatus$ = this.connectionSubject.asObservable();  

  connect (role: 'client' | 'support'){

    const socket = new SockJS('http://localhost:8080/ws'); 

    this.stompClient = new Client({
      webSocketFactory: () => socket, 
      reconnectDelay: 5000,  
      debug: (str) => console.log(str)  
    });

    this.stompClient.onConnect = (frame) => {
      console.log('Connected to WebSocket server');
      this.connectionSubject.next(true);  

      this.stompClient?.subscribe('/topic/public', (message: Message) => {
        this.messageSubject.next(JSON.parse(message.body)); 
      });

      this.stompClient?.publish({
        destination: '/app/chat.addUser',  
        body: JSON.stringify({ sender: role, type: 'JOIN' })  
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']); 
      console.error('Additional details: ' + frame.body);  
    };
    
    this.stompClient?.activate();
  }


  sendMessage(role:string, content:string){
    if (this.stompClient && this.stompClient.connected) {
      const chatMessage = { sender: role, content: content, type: 'CHAT' };
      console.log(`Message sent by ${role}: ${content}`);

      this.stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessage)  
      });
    } else {
      console.error('WebSocket is not connected. Unable to send message.');
    }

  }

  disconnect(){
    if (this.stompClient) {
      this.stompClient.deactivate(); 
    }
  }
  
}