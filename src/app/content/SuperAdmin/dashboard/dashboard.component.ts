import { Component, Inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../navigations/header/header.component';
import { HelloAndDateComponent } from '../../shared/hello-and-date/hello-and-date.component';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, HelloAndDateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardSuperAdminComponent implements OnInit {

  totalAdmin: number = 0;

  constructor(
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.getAllAdmin()
  }

  getAllAdmin() {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/as/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.totalAdmin = response.data.length || 0;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalAdmin = 0
      });
  }
}
