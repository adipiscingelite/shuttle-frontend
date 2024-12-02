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
  styleUrl: './full.component.css',
})
export class FullComponent implements OnInit {
  private apiUrl: string;

  user_id: string = '';

  constructor(
    private cookieService: CookieService,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  async ngOnInit(): Promise<void> {
    await this.fetchProfileData();
  }

  async fetchProfileData(): Promise<void> {
    const token = this.cookieService.get('accessToken');

    try {
      const response = await axios.get(`${this.apiUrl}/api/my/profile`, {
        headers: { Authorization: `${token}` },
      });
      this.user_id = response.data.id;
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  }
}
