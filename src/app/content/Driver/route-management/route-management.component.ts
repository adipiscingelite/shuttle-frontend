import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import * as L from 'leaflet';
import 'leaflet-routing-machine';
import axios from 'axios';

import { Response } from '@core/interfaces';
import { ToastService } from '@core/services/toast/toast.service';

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
  student_order: number;
  shuttle_uuid: ShuttleUUID;
  shuttle_status: ShuttleStatus;
  distance: any;
}

@Component({
  selector: 'app-route-management',
  standalone: true,
  imports: [CommonModule, RouterLink, DragDropModule],
  templateUrl: './route-management.component.html',
  styleUrls: ['./route-management.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class RouteManagementComponent {
  token: string | null = '';
  student_uuid: string = '';
  isLoading: boolean = false;

  private destinationCoords = { lat: 0, lon: 0 };
  distance: string = '';

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private watchId: number | undefined;
  private destinationMarker: L.Marker | undefined;

  rowContohLokasiAnak: Route[] = [];
  studentMarkers: L.Marker[] = [];

  totalDistance: number = 0;

  constructor(
    public toastService: ToastService,
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
  }

  ngOnInit(): void {
    this.getAllShuttleStudent();
    this.startWatchingPosition();
  }

  async getAllShuttleStudent() {
    try {
      this.isLoading = true;

      const response = await axios.get(`${this.apiUrl}/api/driver/route/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      });

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

      this.rowContohLokasiAnak.sort((a, b) => {
        const orderA = a.student_order;
        const orderB = b.student_order;
        return orderA - orderB;
      });

      this.generateRoute();
      this.calculateTotalDistance();
    } catch (error) {
      console.error('Error fetching shuttle students:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private generateRoute() {
    if (!this.map) {
      console.error('Peta belum diinisialisasi!');
      return;
    }

    const driverLatLng = this.marker?.getLatLng();
    if (!driverLatLng) {
      console.error('Lokasi driver tidak tersedia!');
      return;
    }

    if (!this.rowContohLokasiAnak || this.rowContohLokasiAnak.length === 0) {
      console.error('Data lokasi siswa tidak tersedia!');
      return;
    }

    const routeStops: L.LatLng[] = [driverLatLng];

    this.rowContohLokasiAnak.forEach((student) => {
      const { latitude, longitude } = student.student_pickup_point;
      if (latitude && longitude) {
        routeStops.push(L.latLng(latitude, longitude));
      } else {
        console.warn(`Koordinat tidak valid untuk siswa: ${student}`);
      }
    });

    const schoolPoint = this.rowContohLokasiAnak[0]?.school_point;
    if (!schoolPoint || !schoolPoint.latitude || !schoolPoint.longitude) {
      console.error('Lokasi sekolah tidak tersedia atau tidak valid!');
      return;
    }
    routeStops.push(L.latLng(schoolPoint.latitude, schoolPoint.longitude));

    if (routeStops.length < 2) {
      console.error('Rute membutuhkan minimal 2 titik!');
      return;
    }

    try {
      L.Routing.control({
        waypoints: routeStops,
        routeWhileDragging: false,
      }).addTo(this.map);
    } catch (error) {
      console.error('Error saat membuat rute:', error);
    }
  }

  private calculateTotalDistance(): void {
    if (!this.marker || this.rowContohLokasiAnak.length === 0) {
      this.totalDistance = 0;
      return;
    }

    let total = 0;
    let previousLatLng: L.LatLng = this.marker.getLatLng();

    this.rowContohLokasiAnak.forEach((student) => {
      const { latitude, longitude } = student.student_pickup_point;
      const currentLatLng: L.LatLng = L.latLng(latitude, longitude);
      total += previousLatLng.distanceTo(currentLatLng) / 1000;
      previousLatLng = currentLatLng;
    });

    const { latitude, longitude } = this.rowContohLokasiAnak[0].school_point;
    const schoolLatLng: L.LatLng = L.latLng(latitude, longitude);
    total += previousLatLng.distanceTo(schoolLatLng) / 1000;

    this.totalDistance = total;
  }

  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.degToRad(lat2 - lat1);
    const dLon = this.degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degToRad(lat1)) *
        Math.cos(this.degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  jemput(id: string) {
    axios
      .post(
        `${this.apiUrl}/api/driver/shuttle/add`,
        {
          student_uuid: id,
        },
        {
          headers: {
            Authorization: `${this.token}`,
          },
        },
      )
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.getAllShuttleStudent();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  antarKeSekolah(shuttle_id: string) {
    axios
      .put(
        `${this.apiUrl}/api/driver/shuttle/update/${shuttle_id}`,
        {
          status: 'going_to_school',
        },
        {
          headers: {
            Authorization: `${this.token}`,
          },
        },
      )
      .then((response) => {
        this.getAllShuttleStudent();
      })
      .catch((error) => {});
  }
  update(shuttle_id: string, status: string) {
    axios
      .put(
        `${this.apiUrl}/api/driver/shuttle/update/${shuttle_id}`,
        {
          status: status,
        },
        {
          headers: {
            Authorization: `${this.token}`,
          },
        },
      )
      .then((response) => {
        this.getAllShuttleStudent();
      })
      .catch((error) => {});
  }

  private startWatchingPosition(): void {
    if ('geolocation' in navigator) {
      this.isLoading = true;

      if (this.map) {
        this.map.remove();
        this.map = undefined;
      }

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const coordinatesElement = document.getElementById('coordinates');
          if (coordinatesElement) {
            coordinatesElement.textContent = `Latitude: ${lat}, Longitude: ${lon}`;
          }

          this.updateMap(lat, lon);

          this.isLoading = false;
        },
        (error) => {
          console.error('Error watching location:', error);

          const coordinatesElement = document.getElementById('coordinates');
          if (coordinatesElement) {
            coordinatesElement.textContent =
              'Error retrieving location. Retrying...';
          }

          if (error.code === 3) {
            this.isLoading = true;

            setTimeout(() => {
              location.reload();
            }, 3000);
          }

          this.isLoading = false;
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        },
      );
    } else {
      const coordinatesElement = document.getElementById('coordinates');
      if (coordinatesElement) {
        coordinatesElement.textContent =
          'Geolocation is not supported by your browser.';
      }

      this.isLoading = false;
    }
  }

  private updateMap(lat: number, lon: number): void {
    const studentIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/1365/1365700.png',
      iconSize: [35, 35],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const schoolIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/5193/5193783.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    if (!this.map) {
      this.map = L.map('map').setView([lat, lon], 12);
      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(this.map);

      this.marker = L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup('Your Location')
        .openPopup();
    } else {
      if (this.marker) {
        const currentLatLng = this.marker.getLatLng();
        if (currentLatLng.lat !== lat || currentLatLng.lng !== lon) {
          this.marker.setLatLng([lat, lon]);
          this.map.setView([lat, lon]);
        }
      }
    }

    this.rowContohLokasiAnak.forEach((student) => {
      let pickupPoint: { latitude: number; longitude: number };
      let schoolPoint: { latitude: number; longitude: number };

      if (typeof student.student_pickup_point === 'string') {
        pickupPoint = JSON.parse(student.student_pickup_point);
      } else {
        pickupPoint = student.student_pickup_point;
      }

      if (typeof student.school_point === 'string') {
        schoolPoint = JSON.parse(student.school_point);
      } else {
        schoolPoint = student.school_point;
      }

      const { latitude, longitude } = pickupPoint;

      const studentLatLng = L.latLng(latitude, longitude);
      const driverLatLng = this.marker?.getLatLng();

      if (driverLatLng) {
        const distanceInMeters = driverLatLng.distanceTo(studentLatLng);
        const distanceInKilometers = (distanceInMeters / 1000).toFixed(2);

        student.distance = distanceInKilometers;

        L.marker([latitude, longitude], { icon: studentIcon })
          .addTo(this.map!)
          .bindPopup(
            `<b class="capitalize">${student.student_first_name} ${student.student_last_name}</b><br>Distance: ${student.distance} km`,
          );

        L.circle([latitude, longitude], {
          color: 'red',
          fillColor: 'red',
          fillOpacity: 0.2,
          radius: 30,
        }).addTo(this.map!);
      }

      if (schoolPoint) {
        const { latitude: schoolLat, longitude: schoolLng } = schoolPoint;

        L.marker([schoolLat, schoolLng], { icon: schoolIcon })
          .addTo(this.map!)
          .bindPopup(
            `<b>School Location</b><br>Latitude: ${schoolLat}<br>Longitude: ${schoolLng}`,
          );

        L.circle([schoolLat, schoolLng], {
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 0.2,
          radius: 50,
        }).addTo(this.map!);
      }
    });
  }

  showToast(message: string, duration: number, type: Response) {
    this.toastService.add(message, duration, type);
  }

  removeToast(index: number) {
    this.toastService.remove(index);
  }

  onDrop(event: CdkDragDrop<any[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    moveItemInArray(this.rowContohLokasiAnak, previousIndex, currentIndex);

    this.rowContohLokasiAnak = this.rowContohLokasiAnak.map(
      (student, index) => ({
        ...student,
        student_order: index + 1,
      }),
    );

    const movedStudent = this.rowContohLokasiAnak[currentIndex];
    const studentUuid = movedStudent.student_uuid;
    const newOrder = movedStudent.student_order;

    const requestData = {
      new_order: newOrder,
    };

    this.updateStudentOrder(studentUuid, requestData);
  }

  updateStudentOrder(studentUuid: string, requestData: { new_order: number }) {
    axios
      .put(
        `${this.apiUrl}/api/driver/shuttle/order/update/${studentUuid}`,
        requestData,
        {
          headers: {
            Authorization: `${this.cookieService.get('accessToken')}`,
          },
        },
      )
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }
}
