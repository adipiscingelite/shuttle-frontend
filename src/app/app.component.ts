import { Component, OnInit } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { WebSocketService } from './Serices/Shared/WebSocket/web-socket.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment'; // Impor environment
import { SpinnerComponent } from './content/shared/spinner/spinner.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private webSocketService: WebSocketService,
    private cookieService: CookieService,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isSpinnerVisible = true; // Tampilkan spinner saat navigasi dimulai
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isSpinnerVisible = false; // Sembunyikan spinner setelah navigasi selesai
      }
    });
  }

  ngOnInit(): void {
    this.startWebSocket();
    this.getCurrentLocation();
  }

  private async startWebSocket() {
    const apiUrl = environment.apiUrl;
    const ws = environment.ws;
    await this.webSocketService.initializeWebSocket(apiUrl, ws);
  }

  public isSpinnerVisible = false;

  currLat: number = 0;
  currLng: number = 0;

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.currLat = position.coords.latitude;
        this.currLng = position.coords.longitude;
        console.log('pp', this.currLat, 'woi', this.currLng);
      });
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }
}
