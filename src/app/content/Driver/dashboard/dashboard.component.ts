import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import axios from 'axios';
interface Location {
  latitude: number;
  longitude: number;
}
interface ShuttleStatus {
  String: string;
  Valid: boolean;
}

interface ShuttleUUID {
  String: string;
  Valid: boolean;
}

export interface Route {
  driver_uuid: string;
  route_uuid: string;
  school_name: string;
  school_point: Location;
  school_uuid: string;
  student_address: string;
  student_first_name: string;
  student_last_name: string;
  student_pickup_point: Location;
  student_uuid: string;
  shuttle_uuid: ShuttleUUID;
  shuttle_status: ShuttleStatus;
  distance: any;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardDriverComponent {
  token: string | null = '';
  student_uuid: string = '';
  isLoading: boolean = false;

  driver_uuid: string = '';
  route_uuid: string = '';
  school_name: string = '';
  school_point: Location = { latitude: 0, longitude: 0 };
  school_uuid: string = '';
  student_address: string = '';
  student_first_name: string = '';
  student_last_name: string = '';
  student_pickup_point: Location = { latitude: 0, longitude: 0 };
  shuttle_uuid: ShuttleUUID = { String: '', Valid: false };
  shuttle_status: ShuttleStatus = { String: '', Valid: false };

  rowContohLokasiAnak: Route[] = [];
  studentMarkers: L.Marker[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
  }

  ngOnInit(): void {
    this.getAllShuttleStudent();
    // this.startWatchingPosition();
  }

  async getAllShuttleStudent() {
    try {
      this.isLoading = true;

      const response = await axios.get(`${this.apiUrl}/api/driver/route/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      });

      // Mapping data dan menghitung distance
      this.rowContohLokasiAnak = await Promise.all(
        response.data.routes.map(async (route: Route) => {
          const schoolPoint =
            typeof route.school_point === 'string'
              ? (JSON.parse(route.school_point) as Location)
              : route.school_point;

          const studentPickupPoint =
            typeof route.student_pickup_point === 'string'
              ? (JSON.parse(route.student_pickup_point) as Location)
              : route.student_pickup_point;

          return {
            ...route,
            school_point: schoolPoint,
            student_pickup_point: studentPickupPoint,
          };
        }),
      );

      console.log(
        'Data siswa terurut berdasarkan jarak:',
        this.rowContohLokasiAnak,
      );
    } catch (error) {
      console.error('Error fetching shuttle students:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
