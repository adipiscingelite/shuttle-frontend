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

  // Student data
  currentMonthStudents: number = 0;
  previousMonthStudents: number = 0;
  studentChangePercentage: number = 0;

  // Driver data
  currentMonthDrivers: number = 0;
  previousMonthDrivers: number = 0;
  driverChangePercentage: number = 0;

  // Vehicle data
  currentMonthVehicles: number = 0;
  previousMonthVehicles: number = 0;
  vehicleChangePercentage: number = 0;

  // Route data
  currentMonthRoutes: number = 0;
  previousMonthRoutes: number = 0;
  routeChangePercentage: number = 0;

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

        const studentData = response.data.data.data;
        const currentMonth = new Date().getMonth();
        let currentMonthCount = 0;
        let previousMonthCount = 0;

        studentData.forEach((driver: any) => {
          const createdAt = new Date(driver.created_at);
          const studentMonth = createdAt.getMonth();

          if (studentMonth === currentMonth) {
            currentMonthCount++;
          } else if (
            studentMonth === currentMonth - 1 ||
            (currentMonth === 0 && studentMonth === 11)
          ) {
            previousMonthCount++;
          }
        });

        this.currentMonthStudents = currentMonthCount;
        this.previousMonthStudents = previousMonthCount;

        this.studentChangePercentage = this.calculatePercentageChange(
          this.currentMonthStudents,
          this.previousMonthStudents,
        );
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

        const driverData = response.data.data.data;
        const currentMonth = new Date().getMonth();
        let currentMonthCount = 0;
        let previousMonthCount = 0;

        driverData.forEach((driver: any) => {
          const createdAt = new Date(driver.created_at);
          const driverMonth = createdAt.getMonth();

          if (driverMonth === currentMonth) {
            currentMonthCount++;
          } else if (
            driverMonth === currentMonth - 1 ||
            (currentMonth === 0 && driverMonth === 11)
          ) {
            previousMonthCount++;
          }
        });

        this.currentMonthDrivers = currentMonthCount;
        this.previousMonthDrivers = previousMonthCount;

        this.driverChangePercentage = this.calculatePercentageChange(
          this.currentMonthDrivers,
          this.previousMonthDrivers,
        );
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

        const vehicleData = response.data.data.data;
        const currentMonth = new Date().getMonth();
        let currentMonthCount = 0;
        let previousMonthCount = 0;

        vehicleData.forEach((vehicle: any) => {
          const createdAt = new Date(vehicle.created_at);
          const vehicleMonth = createdAt.getMonth();

          if (vehicleMonth === currentMonth) {
            currentMonthCount++;
          } else if (
            vehicleMonth === currentMonth - 1 ||
            (currentMonth === 0 && vehicleMonth === 11)
          ) {
            previousMonthCount++;
          }
        });

        this.currentMonthVehicles = currentMonthCount;
        this.previousMonthVehicles = previousMonthCount;

        this.vehicleChangePercentage = this.calculatePercentageChange(
          this.currentMonthVehicles,
          this.previousMonthVehicles,
        );
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
        console.log(response,'pp');
        
        this.totalRoute = response.data.data.data.length || 0;

        const routeData = response.data.data.data;
        console.log('rispun', routeData);
        const currentMonth = new Date().getMonth();
        let currentMonthCount = 0;
        let previousMonthCount = 0;

        routeData.forEach((route: any) => {
          const createdAt = new Date(route.created_at);
          const routeMonth = createdAt.getMonth();

          if (routeMonth === currentMonth) {
            currentMonthCount++;
          } else if (
            routeMonth === currentMonth - 1 ||
            (currentMonth === 0 && routeMonth === 11)
          ) {
            previousMonthCount++;
          }
        });

        this.currentMonthRoutes = currentMonthCount;
        this.previousMonthRoutes = previousMonthCount;

        this.routeChangePercentage = this.calculatePercentageChange(
          this.currentMonthRoutes,
          this.previousMonthRoutes,
        );

        console.log('pp', this.routeChangePercentage);
        console.log('cur', this.currentMonthRoutes);
        console.log('pre', this.previousMonthRoutes);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalRoute = 0;
      });
  }

  calculatePercentageChange(
    currentCount: number,
    previousCount: number,
  ): number {
    if (previousCount === 0) {
      // Jika bulan sebelumnya tidak ada data
      return currentCount > 0 ? 100 : 0;
    }
  
    const change = ((currentCount - previousCount) / previousCount) * 100;
    return parseFloat(change.toFixed(2));
  }
  
}
