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
    this.getAllChildernRecap();
  }

  ngOnDestroy(): void {
    if (this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
    }

    if (this.map) {
      this.map.remove();
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
        this.rowListRecap = response.data.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );

        this.rowListRecap = this.rowListRecap.slice(0, 3);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.rowListRecap = [];
      });
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
            coordinatesElement.textContent = 'Unable to detect location.';
          }

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
