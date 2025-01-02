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

  getAllShuttleStudent() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/driver/route/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        console.log('pp', response);

        this.rowContohLokasiAnak = response.data.routes.map((route: Route) => ({
          ...route,
          school_point:
            typeof route.school_point === 'string'
              ? (JSON.parse(route.school_point) as {
                  latitude: number;
                  longitude: number;
                }) // Type assertion
              : route.school_point,
          student_pickup_point:
            typeof route.student_pickup_point === 'string'
              ? (JSON.parse(route.student_pickup_point) as {
                  latitude: number;
                  longitude: number;
                }) // Type assertion
              : route.student_pickup_point,
        }));
      })
      .catch((error) => {
        console.error('Error fetching shuttle students:', error);
      });
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

      // Start watching the position
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          // Update coordinates on the page
          const coordinatesElement = document.getElementById('coordinates');
          if (coordinatesElement) {
            coordinatesElement.textContent = `Latitude: ${lat}, Longitude: ${lon}`;
          }

          // Update the map and marker
          this.updateMap(lat, lon);

          // Set loading status to false after location is retrieved
          this.isLoading = false;
        },
        (error) => {
          console.error('Error watching location:', error);

          const coordinatesElement = document.getElementById('coordinates');
          if (coordinatesElement) {
            coordinatesElement.textContent = 'Unable to detect location.';
          }

          // Set loading status to false if there's an error
          this.isLoading = false;
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        },
      );
    } else {
      const coordinatesElement = document.getElementById('coordinates');
      if (coordinatesElement) {
        coordinatesElement.textContent =
          'Geolocation is not supported by your browser.';
      }

      // Set loading status to false if geolocation is not supported
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

        if(student.distance <= 0.1){
          console.log('distance ',student.distance);
          console.log('shuttle uuid',student.shuttle_uuid.String);
          
          // update(shuttle_id: string, status: string) {
            axios
              .put(
                `${this.apiUrl}/api/driver/shuttle/update/${student.shuttle_uuid.String}`,
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
          // }
        }

        // Add a marker for the student
        L.marker([latitude, longitude], { icon: studentIcon })
          .addTo(this.map!)
          .bindPopup(
            `<b>${student.student_first_name}</b><br>UUID: ${student.student_uuid}<br>Lat: ${latitude}, Lon: ${longitude}<br>Distance: ${student.distance} km`,
          );
      }
    });
  }
}
