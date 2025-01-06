import { Component, Inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../layouts/header/header.component';
import { HelloAndDateComponent } from '../../../shared/components/hello-and-date/hello-and-date.component';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

interface GrowthData {
  month: string;
  growth: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeaderComponent, HelloAndDateComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardSuperAdminComponent implements OnInit {
  token: string | null = '';

  totalAdmin: number = 0;
  totalSchool: number = 0;
  totalDriver: number = 0;
  totalVehicle: number = 0;

  currentMonthAdmins: number = 0;
  previousMonthAdmins: number = 0;
  adminChangePercentage: number = 0;

  currentMonthSchools: number = 0;
  previousMonthSchools: number = 0;
  schoolChangePercentage: number = 0;

  currentMonthDrivers: number = 0;
  previousMonthDrivers: number = 0;
  driverChangePercentage: number = 0;

  currentMonthVehicles: number = 0;
  previousMonthVehicles: number = 0;
  vehicleChangePercentage: number = 0;

  currentDate: string | null;
  yesterdayDate: string | null;

  growthData: GrowthData[] = [
    { month: 'Jan', growth: 10 },
    { month: 'Feb', growth: 3 },
    { month: 'Mar', growth: 7 },
    { month: 'Apr', growth: 0 },
    { month: 'May', growth: 0 },
    { month: 'Jun', growth: 0 },
    { month: 'Jul', growth: 0 },
    { month: 'Aug', growth: 0 },
    { month: 'Sep', growth: 0 },
    { month: 'Oct', growth: 0 },
    { month: 'Nov', growth: 0 },
    { month: 'Dec', growth: 0 },
  ];

  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipData = { month: '', growth: 0 };

  isAnimating: boolean = true;

  constructor(
    private cookieService: CookieService,
    private datePipe: DatePipe,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');

    const today = new Date();
    this.currentDate = this.datePipe.transform(today, 'dd-MM-yyyy');

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    this.yesterdayDate = this.datePipe.transform(yesterday, 'dd-MM-yyyy');
  }

  ngOnInit(): void {
    this.getAllAdmin();
    this.getAllSchool();
    this.getAllDriver();
    this.getAllVehicle();

    setInterval(() => {
      this.getAllAdmin();
      this.getAllSchool();
      this.getAllDriver();
      this.getAllVehicle();
    }, 30000);
  }

  getAllAdmin() {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/as/all`, {
        headers: { Authorization: `${this.token}` },
      })
      .then((response) => {
        this.totalAdmin = response.data.data.data.length || 0;

        const adminData = response.data.data.data;
        const currentMonth = new Date().getMonth();
        let currentMonthCount = 0;
        let previousMonthCount = 0;

        adminData.forEach((admin: any) => {
          const createdAt = new Date(admin.created_at);
          const adminMonth = createdAt.getMonth();

          if (adminMonth === currentMonth) {
            currentMonthCount++;
          } else if (
            adminMonth === currentMonth - 1 ||
            (currentMonth === 0 && adminMonth === 11)
          ) {
            previousMonthCount++;
          }
        });

        this.currentMonthAdmins = currentMonthCount;
        this.previousMonthAdmins = previousMonthCount;

        this.adminChangePercentage = this.calculatePercentageChange(
          this.currentMonthAdmins,
          this.previousMonthAdmins,
        );
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalAdmin = 0;
      });
  }

  getAllSchool() {
    axios
      .get(`${this.apiUrl}/api/superadmin/school/all`, {
        headers: { Authorization: `${this.token}` },
      })
      .then((response) => {
        this.totalSchool = response.data.data.data.length || 0;

        const schoolData = response.data.data.data;
        const currentMonth = new Date().getMonth();
        let currentMonthCount = 0;
        let previousMonthCount = 0;

        schoolData.forEach((school: any) => {
          const createdAt = new Date(school.created_at);
          const schoolMonth = createdAt.getMonth();

          if (schoolMonth === currentMonth) {
            currentMonthCount++;
          } else if (
            schoolMonth === currentMonth - 1 ||
            (currentMonth === 0 && schoolMonth === 11)
          ) {
            previousMonthCount++;
          }
        });

        this.currentMonthSchools = currentMonthCount;
        this.previousMonthSchools = previousMonthCount;

        this.schoolChangePercentage = this.calculatePercentageChange(
          this.currentMonthSchools,
          this.previousMonthSchools,
        );
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalSchool = 0;
      });
  }

  getAllDriver() {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/driver/all`, {
        headers: { Authorization: `${this.token}` },
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
      .get(`${this.apiUrl}/api/superadmin/vehicle/all`, {
        headers: { Authorization: `${this.token}` },
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

  calculatePercentageChange(
    currentCount: number,
    previousCount: number,
  ): number {
    if (previousCount === 0) {
      return 0;
    }

    const change = ((currentCount - previousCount) / previousCount) * 100;
    return parseFloat(change.toFixed(2));
  }

  showTooltip(event: MouseEvent, data: any) {
    const target = event.target as SVGCircleElement;
    const cx = target.cx.baseVal.value;
    const cy = target.cy.baseVal.value;

    this.tooltipVisible = true;
    this.tooltipX = cx + 10;
    this.tooltipY = cy + 20;
    this.tooltipData = data;
  }

  hideTooltip() {
    this.tooltipVisible = false;
  }

  getPoints() {
    return this.growthData
      .map((data, i) => `${50 + i * 40},${190 - data.growth * 0.5}`)
      .join(' ');
  }
}
