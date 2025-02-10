import { Component, Inject, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../layouts/header/header.component';
import { HelloAndDateComponent } from '../../../shared/components/hello-and-date/hello-and-date.component';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import * as L from 'leaflet';

interface GrowthData {
  month: string;
  growth: number;
}

interface ShuttleSummary {
  shuttle_count: number;
  shuttle_today: number;
  shuttle_yesterday: number;
  shuttle_date_today: string;
  shuttle_date_yesterday: string;
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

  shuttle_count: number = 0;
  shuttle_today: number = 0;
  shuttle_yesterday: number = 0;
  shuttle_date_today: string = '';
  shuttle_date_yesterday: string = '';

  currentDate: string | null;
  yesterdayDate: string | null;

  growthData: GrowthData[] = [
    // { month: 'Jan', growth: 10 },
    // { month: 'Feb', growth: 3 },
    // { month: 'Mar', growth: 7 },
    // { month: 'Apr', growth: 0 },
    // { month: 'May', growth: 0 },
    // { month: 'Jun', growth: 0 },
    // { month: 'Jul', growth: 0 },
    // { month: 'Aug', growth: 0 },
    // { month: 'Sep', growth: 0 },
    // { month: 'Oct', growth: 0 },
    // { month: 'Nov', growth: 0 },
    // { month: 'Dec', growth: 0 },
  ];

  tooltipVisible = false;
  tooltipX = 0;
  tooltipY = 0;
  tooltipData = { month: '', growth: 0 };

  isAnimating: boolean = true;

  time = '';
  day = '';
  date = '';

  showDiv: boolean = Math.random() < 0.1;

  selectedSchool: any;
  map!: L.Map;
  schools = [
    {
      id: 1,
      name: 'SMAN 8 Yogyakarta',
      lat: -7.7829,
      lng: 110.4141,
      address: 'Jl. Sidobali No.1, Muja Muju, Umbulharjo, Yogyakarta',
    },
    {
      id: 2,
      name: 'SMAN 1 Yogyakarta',
      lat: -7.8015,
      lng: 110.3487,
      address: 'Jl. HOS Cokroaminoto No.10, Pakuncen, Wirobrajan, Yogyakarta',
    },
    {
      id: 3,
      name: 'SMAN 3 Yogyakarta',
      lat: -7.782,
      lng: 110.3671,
      address: 'Jl. Yos Sudarso No.7, Kotabaru, Gondokusuman, Yogyakarta',
    },
    {
      id: 4,
      name: 'SMAN 6 Yogyakarta',
      lat: -7.7825,
      lng: 110.3675,
      address: 'Jl. C. Simanjuntak No.2, Terban, Gondokusuman, Yogyakarta',
    },
    {
      id: 5,
      name: 'SMAN 1 Godean',
      lat: -7.7697,
      lng: 110.2931,
      address: 'Jl. Kebon Agung Km. 5, Godean, Sleman, Yogyakarta',
    },
  ];

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
    this.getAllShuttleSummary();
    this.getStudentGrowth();

    this.initializeMap();
    this.updateDateTime();

    setInterval(() => {
      this.getAllAdmin();
      this.getAllSchool();
      this.getAllDriver();
      this.getAllVehicle();
    }, 30000);
  }

  getAllShuttleSummary() {
    axios
      .get(`${this.apiUrl}/api/superadmin/shuttle/summary`, {
        headers: { Authorization: `${this.token}` },
      })
      .then((response) => {
        console.log('pp', response);

        const dataShuttleSummary = response.data;

        this.shuttle_count = dataShuttleSummary.shuttle_count;
        this.shuttle_today = dataShuttleSummary.shuttle_today;
        this.shuttle_yesterday = dataShuttleSummary.shuttle_yesterday;
        this.shuttle_date_today = dataShuttleSummary.shuttle_date_today;
        this.shuttle_date_yesterday = dataShuttleSummary.shuttle_date_yesterday;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.totalAdmin = 0;
      });
  }

  getStudentGrowth() {
    axios
      .get(`${this.apiUrl}/api/superadmin/student/growth`, {
        headers: { Authorization: `${this.token}` },
      })
      .then((response) => {
        console.log('pp', response);

        // Peta nama bulan dari backend ke format standar
        const monthMapping: { [key: string]: string } = {
          jan: 'Jan',
          feb: 'Feb',
          mar: 'Mar',
          apr: 'Apr',
          mei: 'May', // Bahasa Indonesia
          may: 'May', // Bahasa Inggris
          jun: 'Jun',
          jul: 'Jul',
          aug: 'Aug',
          sep: 'Sep',
          okt: 'Oct', // Bahasa Indonesia
          oct: 'Oct', // Bahasa Inggris
          nov: 'Nov',
          dec: 'Dec',
        };

        // Urutan bulan untuk sortir
        const monthOrder: string[] = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        // Data dari backend
        const backendData = response.data;

        // Konversi data ke GrowthData[]
        this.growthData = Object.entries(backendData).map(([key, value]) => ({
          month: monthMapping[key.toLowerCase()] || key, // Gunakan mapping, fallback ke key asli jika tidak ditemukan
          growth: value as number,
        }));

        // Sortir berdasarkan urutan bulan
        this.growthData.sort(
          (a, b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month),
        );

        console.log('Formatted and sorted growthData:', this.growthData);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.growthData = []; // Kosongkan data jika terjadi error
      });
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

  updateDateTime(): void {
    const now = new Date();
    this.time = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    this.day = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ][now.getDay()];
    this.date = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  initializeMap(): void {
    this.map = L.map('map').setView(
      [-7.782774868433334, 110.36703914403769],
      13,
    );

    // Tile layer dari Google Maps
    L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    }).addTo(this.map);

    // Custom icon untuk marker
    const schoolIcon = L.icon({
      iconUrl: 'assets/images/location_15114817.png', // Path gambar ikon (pastikan ada di assets/icons)
      iconSize: [40, 50], // Ukuran ikon
      iconAnchor: [20, 40], // Anchor agar ujung bawah ikon menyentuh lokasi
      popupAnchor: [0, -40], // Popup muncul di atas ikon
    });

    // Tambahkan marker untuk setiap sekolah
    this.schools.forEach((school) => {
      L.marker([school.lat, school.lng], { icon: schoolIcon })
        .addTo(this.map)
        .on('click', () => this.showSchoolDetails(school));
    });
  }

  showSchoolDetails(school: any): void {
    const popupContent = `
      <div>
          <div class="flex items-center gap-x-2">
            <h4>abcd-1234-efgh</h4>
            <span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19.078 6H8.672A2.672 2.672 0 0 0 6 8.672v10.406a2.672 2.672 0 0 0 2.672 2.672h10.406a2.672 2.672 0 0 0 2.672-2.672V8.672A2.672 2.672 0 0 0 19.078 6Z"></path></svg></span>
          </div>
          <div class="-space-y-1">
            <h1 class="text-xl font-semibold">${school.name}</h1>
            <p class="truncate">${school.address}</p>
            <a href="https://www.google.com/maps?q=${school.lat},${school.lng}" target="_blank" class="text-sm text-blue-500">Open in Google Maps</a>
          </div>
          <hr>
          <div class="pt-2 flex items-center justify-between">
            <button id="viewMoreBtn-${school.id}" class="text-blue-500" type="button">See Details</button>
            <span><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12.31 15.75 16.032 12 12.31 8.25"></path><path d="M15.514 12H7.97"></path><path d="M12 21c4.969 0 9-4.031 9-9s-4.031-9-9-9-9 4.031-9 9 4.031 9 9 9Z"></path></svg></span>
          </div>
      </div>
    `;
    L.popup({ offset: L.point(0, -20) })
      .setLatLng([school.lat, school.lng])
      .setContent(popupContent)
      .openOn(this.map);
    document
      .getElementById(`viewMoreBtn-${school.id}`)
      ?.addEventListener('click', () => {
        this.selectedSchool = school;
      });
  }

  openModal(school: any): void {
    this.selectedSchool = school;
  }

  closeModal(): void {
    this.selectedSchool = null;
  }

  viewMoreDetails(schoolId: number): void {
    alert(`Navigating to more details for school ID ${schoolId}`);
  }
}
