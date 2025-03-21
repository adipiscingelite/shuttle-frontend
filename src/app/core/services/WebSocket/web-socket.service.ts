import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';

@Injectable({
  providedIn: 'root', // Make this service available globally
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private userId: string = '';

  constructor(private cookieService: CookieService) {}

  async initializeWebSocket(apiUrl: string, ws: string): Promise<void> {
    // const token = this.cookieService.get('accessToken');
    // try {
    //   const response = await axios.get(
    //     `${apiUrl}/api/my/profile`,
    //     {
    //       headers: { Authorization: `${token}` },
    //     }
    //   );
    //   this.userId = response.data.id;
    //   console.log('woi', response.data);
    //   this.connectToWebSocket(ws);
    // } catch (error) {
    //   console.error('Error fetching profile data:', error);
    // }
  }

  private connectToWebSocket(ws: string) {
    const socketUrl = `${ws}/${this.userId}`;
    this.socket = new WebSocket(socketUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event) => {
      console.log('Message from WebSocket:', event.data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = (event) => {
      if (event.wasClean) {
        console.log('WebSocket closed cleanly');
      } else {
        console.error('WebSocket closed with error:', event);
      }
    };
  }
}
