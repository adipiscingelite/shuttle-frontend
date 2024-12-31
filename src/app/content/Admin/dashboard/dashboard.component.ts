import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HelloAndDateComponent } from '../../../shared/components/hello-and-date/hello-and-date.component';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
// import { TooltipDirective } from 'webed-team/ng2-tooltip-directive';
// import {tooltipddir}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HelloAndDateComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardAdminComponent {
  token: string | null = '';

  totalStudent: number = 0;
  totalDriver: number = 0;
  totalVehicle: number = 0;
  totalRoute: number = 0;
  
  constructor(
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
  }

  ngOnInit(): void {
    this.getAllStudent();
    this.getAllDriver();
    this.getAllVehicle();
    this.getAllRoute();
  }

  getAllStudent() {
    axios
      .get(`${this.apiUrl}/api/school/student/all`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        this.totalStudent = response.data.data.data.length || 0;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalStudent = 0;
      });
  }

  getAllDriver() {
    axios
      .get(`${this.apiUrl}/api/school/user/driver/all`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        this.totalDriver = response.data.data.data.length || 0;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalDriver = 0;
      });
  }

  getAllVehicle() {
    axios
    .get(`${this.apiUrl}/api/school/vehicle/all`, {
      headers: {
        Authorization: `${this.token}`,
      },
    })
    .then((response) => {
      this.totalVehicle = response.data.data.data.length || 0;
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      this.totalVehicle = 0;
    });
  }

  getAllRoute() {
    axios
      .get(`${this.apiUrl}/api/school/route/all`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        console.log(response);
        
        this.totalRoute = response.data.routes.length || 0;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalRoute = 0;
      });
  }
}
