import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  username = '';
  type = 'CLIENT';
  user: any = null; 
  message = '';
  messages: any[] = [];
  clients: { [key: string]: any[] } = {};
  selectedClient: string | null = null;
  unread: { [key: string]: number } = {};

  constructor(private readonly http: HttpClient, private readonly wsService: WebSocketService) {}

  ngOnInit(): void {
  }

  login() {
    this.http.post('/api/login', { username: this.username, type: this.type }).subscribe((user: any) => {
      this.user = user; 
      this.connectWebSocket();
    });
  }

  connectWebSocket() {
    if (this.user) {
      this.wsService.connect(this.user, (msg: any) => {
        if (this.user.type === 'CLIENT') {
          this.messages.push(msg);
        } else {
          if (!this.clients[msg.fromUser]) {
            this.clients[msg.fromUser] = [];
          }
          this.clients[msg.fromUser].push(msg);
  
          // Badge de notification //
          if (this.selectedClient !== msg.fromUser) {
            this.unread[msg.fromUser] = (this.unread[msg.fromUser] || 0) + 1;
            this.unread = { ...this.unread };
          }
        }
      });
    }
  }
  
  selectClient(client: string) {
    this.selectedClient = client;
    if (this.unread[client]) {
      this.unread = { ...this.unread, [client]: 0 };
    }
  }  

  sendMessage(toUser?: string) {
    if (!this.message) return;
    const msg = {
      fromUser: this.user.username,
      toUser: this.user.type === 'CLIENT' ? 'SUPPORT' : toUser,
      content: this.message,
      timestamp: new Date().toISOString()
    };
    this.wsService.sendMessage(msg);
    if (this.user.type === 'CLIENT') this.messages.push(msg);
    else if (toUser) this.clients[toUser].push(msg);
    this.message = '';
  }
}