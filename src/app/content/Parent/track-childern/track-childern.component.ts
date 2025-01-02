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
  created_at: string; // Format ISO timestamp
  current_date: string; // Format ISO date
  driver_first_name: string;
  driver_last_name: string;
  driver_gender: string;
  driver_username: string;
  driver_uuid: string;
  parent_uuid: string;
  school_name: string;
  school_point: Point; // Coordinate object for latitude and longitude
  school_uuid: string;
  shuttle_status: string;
  shuttle_uuid: string;
  student_first_name: string;
  student_last_name: string;
  student_pickup_point: Point; // Coordinate object for latitude and longitude
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

  // driver_name:string = ''
  created_at: string = '';
  current_date: string = '';
  parent_uuid: string = '';
  school_name: string = '';
  school_uuid: string = '';
  shuttle_status: string = '';
  shuttle_uuid: string = '';
  student_first_name: string = '';
  student_last_name: string = '';
  // student_uuid:string = ''

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

  private map: L.Map | undefined; // Leaflet map instance
  private marker: L.Marker | undefined; // Driver marker
  private destinationMarker: L.Marker | undefined; // Destination marker
  private studentHouseMarker: L.Marker | undefined; // Destination marker
  private watchId: number | undefined; // ID for geolocation watch

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef, // Inject ChangeDetectorRef
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');

    const now = new Date();
    this.currentDate = now.toLocaleDateString(); // For example: 01/02/2025
    this.currentTime = now.toLocaleTimeString(); // For example: 12:45:30 PM
  }

  ngOnInit(): void {
    // Menentukan kondisi berdasarkan URL
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.preview = event.url === '/parent/tracking' ? false : true;
      }
    });

    this.router.navigateByUrl('/parent/tracking');
    this.preview = false;

    if (this.map) {
      this.map.remove(); // Menghapus map lama
      this.map = undefined;
      console.log('map destroy');
    }
    this.getAllMyChildern();
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
      .get(`${this.apiUrl}/api/parent/my/childern/track`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListChildern = response.data;

        console.log('track', response);

        this.rowListChildern.forEach((child) => {
          const initialAvatar =
            child.student_first_name.charAt(0).toUpperCase() +
            child.student_last_name.charAt(0).toUpperCase();
          // console.log(
          //   `Initial for ${child.first_name} ${child.last_name}: ${initial}`,
          // );
        });

        // this.rowListAllDriver = response.data.data.data;
        // this.paginationTotalPage = response.data.data.meta.total_pages;
        // this.pages = Array.from(
        //   { length: this.paginationTotalPage },
        //   (_, i) => i + 1,
        // );
        // this.showing = response.data.data.meta.showing;

        // console.log('drivers', this.rowListAllDriver);
        // this.isLoading = false;

        // this.cdRef.detectChanges();
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
        // Ekstrak alamat dari response
        this.address = response.data.display_name || 'Address not found';
        console.log('get addr', this.address);
      })
      .catch((error) => {
        console.error('Error fetching address:', error);
        this.address = 'Unable to fetch address';
      });
  }

  calculateDistance(): void {
    if (this.marker && this.destinationMarker) {
      // Ambil koordinat marker rumah siswa dan destinasi
      const studentLatLng = this.marker.getLatLng();
      const destinationLatLng = this.destinationMarker.getLatLng();

      // Hitung jarak dalam meter
      const distanceInMeters = studentLatLng.distanceTo(destinationLatLng);
      // Hitung jarak dalam kilometer
      const distanceInKilometers = distanceInMeters / 1000;

      // Format jarak dalam dua angka desimal
      this.distance = distanceInKilometers.toFixed(2); // Menambahkan 2 angka desimal

      // Menampilkan jarak dalam kilometer
      console.log(`Distance from driver to destination: ${this.distance} km`);

      // Bisa juga menampilkan jarak di UI
      // const distanceElement = document.getElementById('distance');
      // if (distanceElement) {
      //   distanceElement.textContent = `Distance: ${Math.round(distance / 1000)} km`;
      // }
    }
  }

  // https://cdn-icons-png.flaticon.com/128/1048/1048315.png
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
    const carIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/1048/1048315.png', // Path ke ikon Anda
      iconSize: [32, 32], // Ukuran ikon [width, height]
      iconAnchor: [16, 32], // Titik jangkar ikon
      popupAnchor: [0, -32], // Posisi popup relatif terhadap ikon
    });
    const houseIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/1018/1018675.png', // Path ke ikon Anda
      iconSize: [32, 32], // Ukuran ikon [width, height]
      iconAnchor: [16, 32], // Titik jangkar ikon
      popupAnchor: [0, -32], // Posisi popup relatif terhadap ikon
    });

    if (!this.map) {
      // Initialize the map on the first update
      this.map = L.map('map').setView([lat, lon], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      // Add a marker at the user's location
      this.marker = L.marker([lat, lon], { icon: carIcon })
        .addTo(this.map)
        .bindPopup('Driver ' + this.driver_first_name)
        .openPopup();

      // Tambahkan marker destinasi
      this.destinationMarker = L.marker([
        this.destinationCoords.lat,
        this.destinationCoords.lon,
      ])
        .addTo(this.map)
        .bindPopup(this.destination);

      // Tambahkan marker destinasi
      console.log(
        'rumah jawa',
        this.pickup_point?.latitude,
        this.pickup_point?.longitude,
      );

      console.log('Adding student house marker to the map');
      this.studentHouseMarker = L.marker(
        [this.pickup_point?.latitude ?? 0, this.pickup_point?.longitude ?? 0],
        { icon: houseIcon },
      )
        .addTo(this.map)
        .bindPopup(`${this.student_first_name}'s House`);
      // .openPopup();
      console.log('Marker added:', this.studentHouseMarker);

      this.calculateDistance();
      // .openPopup();
    } else {
      // Update posisi marker driver saat lokasi berubah
      if (this.marker) {
        const currentLatLng = this.marker.getLatLng();
        if (currentLatLng.lat !== lat || currentLatLng.lng !== lon) {
          this.marker.setLatLng([lat, lon]);
          this.map.setView([lat, lon]);
          this.calculateDistance(); // Adjust the view to center the new location
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
        const dataArray = response.data; // 'data' adalah array
        if (dataArray.length > 0) {
          const data = dataArray[0]; // Ambil elemen pertama array
          console.log('ditel', data);

          this.destination = data.school_name;
          this.school_point = JSON.parse(data.school_point); // Parse jika string JSON
          this.current_date = data.current_date;
          this.start_time = data.created_at;
          this.pickup_point = JSON.parse(data.student_pickup_point); // Parse jika string JSON
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

          console.log(this.destination);
          console.log(this.school_point);
          console.log(this.current_date);
          console.log(this.start_time);
        } else {
          console.error('Data array is empty');
        }

        this.isLoading = false;
        this.preview = true;

        this.startWatchingPosition(); // Memulai pengawasan posisi

        this.getAddress(
          this.pickup_point?.latitude ?? 0,
          this.pickup_point?.longitude ?? 0,
        );

        console.log(
          'dlm cunf',
          this.pickup_point?.latitude,
          this.pickup_point?.longitude,
        );

        this.router.navigate([`/parent/tracking/details/${uuid}`]);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      });
  }
}
