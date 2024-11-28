import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../navigations/header/header.component';
import { SidebarComponent } from '../../navigations/sidebar/sidebar.component';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './full.component.html',
  styleUrl: './full.component.css'
})
export class FullComponent implements OnInit {
  private apiUrl: string;

  title = 'woila';
  user_id: string = '';

  constructor(
    private cookieService: CookieService,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.fetchProfileData();
  }
  
  fetchProfileData() {
    const token = this.cookieService.get('accessToken');
    
    axios
      .get(`${this.apiUrl}/api/my/profile`, {
        headers: { Authorization: `${token}` },
      })
      .then((response) => {
        console.log('profil jawa', response);
        this.user_id = response.data.user_id;
        // Setelah mendapatkan user_id, buka koneksi WebSocket
        this.connectToWebSocket(this.user_id);
      })
      .catch((error) => {
        console.error('Error fetching profile data:', error);
      });
  }
  
  connectToWebSocket(user_id: string) {
    // Tentukan URL WebSocket dengan benar menggunakan this.apiUrl
    const wsProtocol = this.apiUrl.startsWith('https') ? 'wss' : 'ws';
    const socket = new WebSocket(`${wsProtocol}://192.168.110.84:8080/ws/67404e553e072eef1b8eb67b`);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
  
    socket.onmessage = (event) => {
      console.log('Message from WebSocket:', event.data);
    };
  
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    socket.onclose = () => {
      console.log('WebSocket closed');
    };
  }
    
}
