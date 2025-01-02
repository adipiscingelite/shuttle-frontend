import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import * as L from 'leaflet';
import axios from 'axios';
import { HelloAndDateComponent } from '@shared/components/hello-and-date/hello-and-date.component';
import { RouterLink } from '@angular/router';

interface Childern {
  student_uuid: string;
  first_name: string;
  last_name: string;
  grade: string;
  gender: string;
  school_uuid: string;
  school_name: string;
}

interface Recap {
  shuttle_uuid: string;
  student_uuid: string;
  student_first_name: string;
  student_last_name: string;
  student_grade: string;
  student_gender: string;
  school_uuid: string;
  school_name: string;
  status: string;
  date: string;
  created_at: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HelloAndDateComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardParentComponent implements OnInit {
  isModalParentForCheckTheChildDetail = false;

  token: string | null = '';

  first_name: string = '';
  last_name: string = '';

  initialAvatar: string = '';
  currentDate: string = '';

  isLoading: boolean = false;

  rowListChildern: Childern[] = [];
  rowListRecap: Recap[] = [];

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private destinationMarker: L.Marker | undefined;
  private studentHouseMarker: L.Marker | undefined;
  private watchId: number | undefined;

  constructor(
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
    private datePipe: DatePipe,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
    this.currentDate = this.datePipe.transform(
      new Date(),
      'EEEE, d MMMM yyyy',
      'id-ID',
    )!;
  }

  ngOnInit(): void {
    this.startWatchingPosition();
    this.getAllMyChildern();
    this.getAllChildernRecap()
  }

  ngOnDestroy(): void {
    // Stop watching the position when the component is destroyed
    if (this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    // Clean up map if needed (if you need to fully reset the map)
    if (this.map) {
      this.map.remove(); // Optional: make sure to remove map on destroy
    }
  }

  getAllMyChildern() {
    axios
      .get(`${this.apiUrl}/api/parent/my/childern/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListChildern = response.data.data;

        this.rowListChildern.forEach((child) => {
          const initialAvatar =
            child.first_name.charAt(0).toUpperCase() +
            child.last_name.charAt(0).toUpperCase();
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  getAllChildernRecap() {
    axios
      .get(`${this.apiUrl}/api/parent/my/childern/recap`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        console.log('rekap', response);
  
        // Sort by `created_at` in descending order
        this.rowListRecap = response.data.sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
  
        // Take only the top 3 records
        this.rowListRecap = this.rowListRecap.slice(0, 3);
  
        console.log(this.rowListRecap);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.rowListRecap = []; // Ensure it's empty in case of error
      });
  }
  
  private startWatchingPosition(): void {
    if ('geolocation' in navigator) {
      // Tampilkan spinner saat menunggu
      this.isLoading = true;

      // Reset map jika sudah ada
      if (this.map) {
        this.map.remove(); // Menghapus map lama
        this.map = undefined; // Menghapus referensi map
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
          enableHighAccuracy: true, // Use high-accuracy mode if available
          maximumAge: 0, // Prevent using cached location
          timeout: 10000, // Timeout after 10 seconds if no location is retrieved
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
    if (!this.map) {
      this.map = L.map('map').setView([lat, lon], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
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
  }
}
