import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Inject,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import axios from 'axios';
import * as L from 'leaflet';
import { CookieService } from 'ngx-cookie-service';

export interface ShuttleProgress {
  driver_name: string;
  created_at: string;
  current_date: string;
  parent_uuid: string;
  school_name: string;
  school_uuid: string;
  shuttle_status: string;
  shuttle_uuid: string;
  student_first_name: string;
  student_last_name: string;
  student_uuid: string;
}

interface ShuttleSpec {
  created_at: string;
  current_date: string;
  driver_first_name: string;
  driver_last_name: string;
  driver_gender: string;
  driver_username: string;
  driver_uuid: string;
  parent_uuid: string;
  school_name: string;
  school_point: Point;
  school_uuid: string;
  shuttle_status: string;
  shuttle_uuid: string;
  student_first_name: string;
  student_last_name: string;
  student_pickup_point: Point;
  student_uuid: string;
  vehicle_color: string;
  vehicle_name: string;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_uuid: string;
}

export interface Point {
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-track-childern',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-childern.component.html',
  styleUrls: ['./track-childern.component.css'],
})
export class TrackChildernComponent implements OnInit, OnDestroy {
  token: string | null = '';

  created_at: string = '';
  current_date: string = '';
  parent_uuid: string = '';
  school_name: string = '';
  school_uuid: string = '';
  shuttle_status: string = '';
  shuttle_uuid: string = '';
  student_first_name: string = '';
  student_last_name: string = '';

  start_time: string = '';
  pickup_point: { latitude: number; longitude: number } | null = null;
  school_point: { latitude: number; longitude: number } | null = null;

  rowListChildern: ShuttleProgress[] = [];

  driver_uuid: string = '';
  driver_username: string = '';
  driver_first_name: string = '';
  driver_last_name: string = '';
  driver_gender: string = '';
  student_uuid: string = '';
  student_name: string = '';
  destination: string = '';

  vehicle_name: string = '';
  vehicle_type: string = '';
  vehicle_number: string = '';
  vehicle_color: string = '';

  driver: {
    name: string;
    age: number;
    gender: string;
    vehicle: string;
    plate: string;
  } = {
    name: '',
    age: 0,
    gender: '',
    vehicle: '',
    plate: '',
  };

  vehicleInfo: { type: string; color: string; plateNumber: string } = {
    type: '',
    color: '',
    plateNumber: '',
  };

  currentDate: string;
  currentTime: string;

  preview: boolean = false;
  isLoading: boolean = false;

  address: string | null = null;
  distance: string | null = null;

  private destinationCoords = { lat: 0, lon: 0 };

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private destinationMarker: L.Marker | undefined;
  private studentHouseMarker: L.Marker | undefined;
  private watchId: number | undefined;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');

    const now = new Date();
    this.currentDate = now.toLocaleDateString();
    this.currentTime = now.toLocaleTimeString();
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.preview = event.url === '/parent/tracking' ? false : true;
      }
    });

    this.router.navigateByUrl('/parent/tracking');
    this.preview = false;

    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
    this.getAllMyChildern();
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
      .get(`${this.apiUrl}/api/parent/my/childern/track`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListChildern = response.data;

        this.rowListChildern.forEach((child) => {
          const initialAvatar =
            child.student_first_name.charAt(0).toUpperCase() +
            child.student_last_name.charAt(0).toUpperCase();
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  getAddress(lat: number, lon: number): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    axios
      .get(url)
      .then((response) => {
        this.address = response.data.display_name || 'Address not found';
      })
      .catch((error) => {
        console.error('Error fetching address:', error);
        this.address = 'Unable to fetch address';
      });
  }

  calculateDistance(): void {
    if (this.marker && this.destinationMarker) {
      const studentLatLng = this.marker.getLatLng();
      const destinationLatLng = this.destinationMarker.getLatLng();

      const distanceInMeters = studentLatLng.distanceTo(destinationLatLng);

      const distanceInKilometers = distanceInMeters / 1000;

      this.distance = distanceInKilometers.toFixed(2);
    }
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
    const carIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/1048/1048315.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
    const houseIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/1018/1018675.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    if (!this.map) {
      this.map = L.map('map').setView([lat, lon], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      this.marker = L.marker([lat, lon], { icon: carIcon })
        .addTo(this.map)
        .bindPopup('Driver ' + this.driver_first_name)
        .openPopup();

      this.destinationMarker = L.marker([
        this.destinationCoords.lat,
        this.destinationCoords.lon,
      ])
        .addTo(this.map)
        .bindPopup(this.destination);

      this.studentHouseMarker = L.marker(
        [this.pickup_point?.latitude ?? 0, this.pickup_point?.longitude ?? 0],
        { icon: houseIcon },
      )
        .addTo(this.map)
        .bindPopup(`${this.student_first_name}'s House`);

      this.calculateDistance();
    } else {
      if (this.marker) {
        const currentLatLng = this.marker.getLatLng();
        if (currentLatLng.lat !== lat || currentLatLng.lng !== lon) {
          this.marker.setLatLng([lat, lon]);
          this.map.setView([lat, lon]);
          this.calculateDistance();
        }
      }
    }
  }

  openTab = 1;
  toggleTabs($tabNumber: number) {
    this.openTab = $tabNumber;
  }

  detail(uuid: string) {
    axios
      .get(`${this.apiUrl}/api/parent/my/childern/shuttle/${uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const dataArray = response.data;
        if (dataArray.length > 0) {
          const data = dataArray[0];

          this.destination = data.school_name;
          this.school_point = JSON.parse(data.school_point);
          this.current_date = data.current_date;
          this.start_time = data.created_at;
          this.pickup_point = JSON.parse(data.student_pickup_point);
          this.student_first_name = data.student_first_name;
          this.driver_username = data.driver_username;
          this.destinationCoords = {
            lat: this.school_point?.latitude ?? 0,
            lon: this.school_point?.longitude ?? 0,
          };
          this.driver_first_name = data.driver_first_name;
          this.driver_last_name = data.driver_last_name;
          this.driver_gender = data.driver_gender;

          this.vehicle_name = data.vehicle_name;
          this.vehicle_type = data.vehicle_type;
          this.vehicle_number = data.vehicle_number;
          this.vehicle_color = data.vehicle_color;
        } else {
          console.error('Data array is empty');
        }

        this.isLoading = false;
        this.preview = true;

        this.startWatchingPosition();

        this.getAddress(
          this.pickup_point?.latitude ?? 0,
          this.pickup_point?.longitude ?? 0,
        );

        this.router.navigate([`/parent/tracking/details/${uuid}`]);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      });
  }
}
