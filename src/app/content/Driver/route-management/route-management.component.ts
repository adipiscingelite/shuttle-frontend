import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import * as L from 'leaflet';
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
  selector: 'app-route-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-management.component.html',
  styleUrls: ['./route-management.component.css'],
})
export class RouteManagementComponent {
  token: string | null = '';
  student_uuid: string = '';
  isLoading: boolean = false;

  private destinationCoords = { lat: 0, lon: 0 };
  distance: string = '';

  private map: L.Map | undefined; // Leaflet map instance
  private marker: L.Marker | undefined; // Driver marker
  private watchId: number | undefined; // ID for geolocation watch
  private destinationMarker: L.Marker | undefined; // Destination marker

  // Lokasi destinasi

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

          // Hitung jarak antara driver (current location) dengan student pickup point
          const driverLatLng = this.marker?.getLatLng();
          let distanceInKilometers: number = NaN;

          if (driverLatLng) {
            const studentLatLng = L.latLng(
              studentPickupPoint.latitude,
              studentPickupPoint.longitude,
            );
            const distanceInMeters = driverLatLng.distanceTo(studentLatLng);
            distanceInKilometers = distanceInMeters / 1000; // Jarak dalam kilometer
          }

          return {
            ...route,
            school_point: schoolPoint,
            student_pickup_point: studentPickupPoint,
            distance: distanceInKilometers,
          };
        }),
      );

      // Urutkan berdasarkan distance terkecil
      this.rowContohLokasiAnak.sort((a, b) => {
        const distA = a.distance || Infinity;
        const distB = b.distance || Infinity;
        return distA - distB; // Urutan ascending
      });

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
        // const responseMessage = response.data?.message || 'Success.';
        // this.showToast(responseMessage, 3000, Response.Success);

        this.getAllShuttleStudent();

        // this.isModalAddOpen = false;
        // this.cdRef.detectChanges();
      })
      .catch((error) => {
        // const responseMessage =
        //   error.response?.data?.message || 'An unexpected error occurred.';
        // this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  antarKeSekolah(shuttle_id: string) {
    axios
      .put(
        `${this.apiUrl}/api/driver/shuttle/update/${shuttle_id}`,
        {
          // student_uuid: id,
          status: 'going_to_school',
        },
        {
          headers: {
            Authorization: `${this.token}`,
          },
        },
      )
      .then((response) => {
        // const responseMessage = response.data?.message || 'Success.';
        // this.showToast(responseMessage, 3000, Response.Success);

        this.getAllShuttleStudent();

        // this.isModalAddOpen = false;
        // this.cdRef.detectChanges();
      })
      .catch((error) => {
        // const responseMessage =
        //   error.response?.data?.message || 'An unexpected error occurred.';
        // this.showToast(responseMessage, 3000, Response.Error);
      });
  }
  update(shuttle_id: string, status: string) {
    axios
      .put(
        `${this.apiUrl}/api/driver/shuttle/update/${shuttle_id}`,
        {
          // student_uuid: id,
          status: status,
        },
        {
          headers: {
            Authorization: `${this.token}`,
          },
        },
      )
      .then((response) => {
        // const responseMessage = response.data?.message || 'Success.';
        // this.showToast(responseMessage, 3000, Response.Success);

        this.getAllShuttleStudent();

        // this.isModalAddOpen = false;
        // this.cdRef.detectChanges();
      })
      .catch((error) => {
        // const responseMessage =
        //   error.response?.data?.message || 'An unexpected error occurred.';
        // this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  private startWatchingPosition(): void {
    if ('geolocation' in navigator) {
      // Tampilkan spinner saat menunggu
      this.isLoading = true;

      // Reset map jika sudah ada
      if (this.map) {
        this.map.remove();
        this.map = undefined;
      }

      // Mulai melacak posisi
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          // Update koordinat di halaman
          const coordinatesElement = document.getElementById('coordinates');
          if (coordinatesElement) {
            coordinatesElement.textContent = `Latitude: ${lat}, Longitude: ${lon}`;
          }

          // Update peta dan marker
          this.updateMap(lat, lon);

          // Set loading selesai
          this.isLoading = false;
        },
        (error) => {
          console.error('Error watching location:', error);

          // Tampilkan pesan error sementara
          const coordinatesElement = document.getElementById('coordinates');
          if (coordinatesElement) {
            coordinatesElement.textContent =
              'Error retrieving location. Retrying...';
          }

          // Jika error code 3 (timeout), coba refresh otomatis
          if (error.code === 3) {
            console.log('Timeout error. Retrying to locate...');
            this.isLoading = true;

            // Refresh halaman untuk mencoba ulang
            setTimeout(() => {
              location.reload();
            }, 3000); // Refresh setelah 3 detik
          }

          // Set loading selesai jika ada error lain
          this.isLoading = false;
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000, // Timeout 10 detik
        },
      );
    } else {
      const coordinatesElement = document.getElementById('coordinates');
      if (coordinatesElement) {
        coordinatesElement.textContent =
          'Geolocation is not supported by your browser.';
      }

      // Set loading selesai jika geolocation tidak didukung
      this.isLoading = false;
    }
  }

  private updateMap(lat: number, lon: number): void {
    const studentIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/3153/3153024.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    if (!this.map) {
      // Initialize map
      this.map = L.map('map').setView([lat, lon], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      // Marker for the driver's location
      this.marker = L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup('Your Location')
        .openPopup();
    } else {
      // Update driver's marker location
      if (this.marker) {
        const currentLatLng = this.marker.getLatLng();
        if (currentLatLng.lat !== lat || currentLatLng.lng !== lon) {
          this.marker.setLatLng([lat, lon]);
          this.map.setView([lat, lon]);
        }
      }
    }

    // Add markers for students' pickup locations and calculate distance from driver
    this.rowContohLokasiAnak.forEach((student) => {
      let pickupPoint: { latitude: number; longitude: number };

      // Check if `student.student_pickup_point` is a string
      if (typeof student.student_pickup_point === 'string') {
        pickupPoint = JSON.parse(student.student_pickup_point);
      } else {
        pickupPoint = student.student_pickup_point; // Already an object
      }

      const { latitude, longitude } = pickupPoint;

      // Calculate the distance between the driver and the student
      const studentLatLng = L.latLng(latitude, longitude);
      const driverLatLng = this.marker?.getLatLng();

      if (driverLatLng) {
        const distanceInMeters = driverLatLng.distanceTo(studentLatLng);
        const distanceInKilometers = (distanceInMeters / 1000).toFixed(2); // Distance in kilometers

        // Update the student's distance property
        student.distance = distanceInKilometers;

        if (parseFloat(student.distance) <= 0.3) {
        }

        if (parseFloat(student.distance) <= 0.15) {
          console.log('distance ', student.distance);
          console.log('shuttle uuid', student.shuttle_uuid.String);

          // axios
          //   .put(
          //     `${this.apiUrl}/api/driver/shuttle/update/${student.shuttle_uuid.String}`,
          //     {
          //       status: 'going_to_school',
          //     },
          //     {
          //       headers: {
          //         Authorization: `${this.token}`,
          //       },
          //     },
          //   )
          //   .then((response) => {
          //     this.getAllShuttleStudent();
          //   })
          //   .catch((error) => {});
        }

        // Add a marker for the student
        L.marker([latitude, longitude], { icon: studentIcon })
          .addTo(this.map!)
          .bindPopup(
            `<b class="capitalize">${student.student_first_name} ${student.student_last_name}</b><br>Distance: ${student.distance} km`,
          );

        // Add a circle around the student's pickup point (radius 10 meters, opacity 50%)
        L.circle([latitude, longitude], {
          color: 'red', // Circle color
          // colorOpacity: 0.5,
          fillColor: 'red', // Fill color
          fillOpacity: 0.2, // 50% opacity
          radius: 30, // 10 meters
        }).addTo(this.map!);
      }
    });
  }
}
