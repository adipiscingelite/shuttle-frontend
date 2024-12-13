import { Component, Inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../layouts/header/header.component';
import { HelloAndDateComponent } from '../../../shared/components/hello-and-date/hello-and-date.component';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [HeaderComponent, HelloAndDateComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardSuperAdminComponent implements OnInit {
  token: string | null = '';

  totalAdmin: number = 0;
  totalSchool: number = 0;
  totalDriver: number = 0;
  totalVehicle: number = 0;

  constructor(
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
  }

  ngOnInit(): void {
    this.getAllAdmin();
    this.getAllSchool();
    this.getAllDriver();
    this.getAllVehicle();
  }

  getAllAdmin() {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/as/all`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        this.totalAdmin = response.data.length || 0;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalAdmin = 0;
      });
  }

  getAllSchool() {
    axios
      .get(`${this.apiUrl}/api/superadmin/school/all`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        this.totalSchool = response.data.length || 0;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalSchool = 0;
      });
  }

  getAllDriver() {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/driver/all`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        this.totalDriver = response.data.length || 0;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalDriver = 0;
      });
  }

  getAllVehicle() {
    axios
      .get(`${this.apiUrl}/api/superadmin/vehicle/all`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        this.totalVehicle = response.data.length || 0;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalVehicle = 0;
      });
  }
}
