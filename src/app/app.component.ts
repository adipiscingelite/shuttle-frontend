import { Component, OnInit } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';
import { WebSocketService } from './core/services/WebSocket/web-socket.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';
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
        this.isSpinnerVisible = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isSpinnerVisible = false;
      }
    });
  }

  ngOnInit(): void {
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
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(
            'Your location:',
            position.coords.latitude,
            position.coords.longitude,
          );
        },
        (error) => {
          console.error(error.message);
        },
      );
    } else {
      console.error('Geolocation tidak didukung oleh browser ini');
    }
  }
}
