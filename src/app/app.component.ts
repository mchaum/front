import { Component, OnInit } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  title = 'frontend';
  role: 'client' | 'support' | null = null;
  message: string = '';
  messages: any[] = [];
  isConnected = false;
  connectingMessage = 'Connecting...';

  constructor(private readonly websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.websocketService.messages$.subscribe(message => {
      if (message) {
        this.messages.push(message);
      }
    });

    this.websocketService.connectionStatus$.subscribe(connected => {
      this.isConnected = connected;
      if (connected) this.connectingMessage = '';
    });
  }

  setRole(role: 'client' | 'support') {
    this.role = role;
    this.websocketService.connect(role); 
  }

  sendMessage() {
    if (this.message && this.role) {
      this.websocketService.sendMessage(this.role, this.message);
      this.message = '';
    }
  }
}