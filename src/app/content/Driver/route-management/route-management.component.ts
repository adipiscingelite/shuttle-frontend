import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import * as L from 'leaflet';
import 'leaflet-routing-machine'; // Include the routing library
import axios from 'axios';
import { Response } from '@core/interfaces';
import { ToastService } from '@core/services/toast/toast.service';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

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
  encapsulation: ViewEncapsulation.None, // Disable view encapsulation
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

  totalDistance: number = 0; 
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
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

      console.log('pppp', response);

      // Mapping data tanpa menghitung jarak, hanya mengambil data yang dibutuhkan
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

      // Urutkan berdasarkan student_order yang sudah ada di respons
      this.rowContohLokasiAnak.sort((a, b) => {
        const orderA = a.student_order; // Mengonversi string ke number
        const orderB = b.student_order; // Mengonversi string ke number
        return orderA - orderB; // Urutan ascending berdasarkan student_order
      });

      console.log(
        'Data siswa terurut berdasarkan student_order:',
        this.rowContohLokasiAnak,
      );

      this.generateRoute();
      this.calculateTotalDistance();
    } catch (error) {
      console.error('Error fetching shuttle students:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private generateRoute() {
    // Get driver location
    const driverLatLng = this.marker?.getLatLng();

    if (driverLatLng) {
      // Route stops array, start with driver's position
      const routeStops: L.LatLng[] = [driverLatLng];

      // Add students' pickup points in order of student_order
      this.rowContohLokasiAnak.forEach((student) => {
        const { latitude, longitude } = student.student_pickup_point;
        routeStops.push(L.latLng(latitude, longitude));
      });

      // Add the school location at the end
      const { latitude, longitude } = this.rowContohLokasiAnak[0].school_point; // Assuming school is the same for all students
      routeStops.push(L.latLng(latitude, longitude));

      // Initialize the routing control
      L.Routing.control({
        waypoints: routeStops, // Stops for the route
        routeWhileDragging: false, // Enable dragging of route while creating
        // Optionally, disable markers for each stop if you don't need them
        // createRouteMarker: () => null,  // Disable route markers entirely
      }).addTo(this.map!);
    }
  }

  private calculateTotalDistance(): void {
    if (!this.marker || this.rowContohLokasiAnak.length === 0) {
      this.totalDistance = 0;
      return;
    }

    let total = 0;
    let previousLatLng: L.LatLng = this.marker.getLatLng();

    this.rowContohLokasiAnak.forEach(student => {
      const { latitude, longitude } = student.student_pickup_point;
      const currentLatLng: L.LatLng = L.latLng(latitude, longitude);
      total += previousLatLng.distanceTo(currentLatLng) / 1000; // km
      previousLatLng = currentLatLng;
    });

    const { latitude, longitude } = this.rowContohLokasiAnak[0].school_point;
    const schoolLatLng: L.LatLng = L.latLng(latitude, longitude);
    total += previousLatLng.distanceTo(schoolLatLng) / 1000; // km

    this.totalDistance = total; // ✅ Simpan nilai jarak ke variabel untuk ditampilkan di HTML
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

        // this.isModalAddOpen = false;
        // this.cdRef.detectChanges();
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
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/1365/1365700.png',
      iconSize: [35, 35],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    const schoolIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/128/5193/5193783.png', // Ganti dengan URL ikon sekolah
      iconSize: [30, 30], // Ukuran ikon
      iconAnchor: [15, 30], // Posisi anchor ikon
    });

    if (!this.map) {
      // Initialize map
      this.map = L.map('map').setView([lat, lon], 12);
      L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
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
      let schoolPoint: { latitude: number; longitude: number };

      // Parsing `student_pickup_point` jika berupa string
      if (typeof student.student_pickup_point === 'string') {
        pickupPoint = JSON.parse(student.student_pickup_point);
      } else {
        pickupPoint = student.student_pickup_point; // Sudah berupa objek
      }

      // Parsing `school_point` jika berupa string
      if (typeof student.school_point === 'string') {
        schoolPoint = JSON.parse(student.school_point);
      } else {
        schoolPoint = student.school_point; // Sudah berupa objek
      }

      const { latitude, longitude } = pickupPoint;

      // Hitung jarak antara driver dan student
      const studentLatLng = L.latLng(latitude, longitude);
      const driverLatLng = this.marker?.getLatLng();

      if (driverLatLng) {
        const distanceInMeters = driverLatLng.distanceTo(studentLatLng);
        const distanceInKilometers = (distanceInMeters / 1000).toFixed(2); // Jarak dalam km

        // Update properti distance pada student
        student.distance = distanceInKilometers;

        // Marker untuk pickup point student
        L.marker([latitude, longitude], { icon: studentIcon })
          .addTo(this.map!)
          .bindPopup(
            `<b class="capitalize">${student.student_first_name} ${student.student_last_name}</b><br>Distance: ${student.distance} km`,
          );

        // Tambahkan circle di sekitar pickup point student
        L.circle([latitude, longitude], {
          color: 'red', // Warna lingkaran
          fillColor: 'red', // Warna isi lingkaran
          fillOpacity: 0.2, // Opasitas 50%
          radius: 30, // Radius 30 meter
        }).addTo(this.map!);
      }

      // Marker untuk school point
      if (schoolPoint) {
        const { latitude: schoolLat, longitude: schoolLng } = schoolPoint;

        L.marker([schoolLat, schoolLng], { icon: schoolIcon })
          .addTo(this.map!)
          .bindPopup(
            `<b>School Location</b><br>Latitude: ${schoolLat}<br>Longitude: ${schoolLng}`,
          );

        // Tambahkan circle di sekitar school point (opsional)
        L.circle([schoolLat, schoolLng], {
          color: 'blue',
          fillColor: 'blue',
          fillOpacity: 0.2,
          radius: 50, // Radius 50 meter
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

    // Pindahkan item dalam array
    moveItemInArray(this.rowContohLokasiAnak, previousIndex, currentIndex);

    // Update `student_order` sesuai urutan yang baru
    this.rowContohLokasiAnak = this.rowContohLokasiAnak.map(
      (student, index) => ({
        ...student,
        student_order: index + 1, // Update urutan berdasarkan posisi baru
      }),
    );

    // Ambil student_uuid dan student_order yang telah diubah posisinya
    const movedStudent = this.rowContohLokasiAnak[currentIndex];
    const studentUuid = movedStudent.student_uuid;
    const newOrder = movedStudent.student_order;

    // Buat requestData untuk mengupdate urutan
    const requestData = {
      new_order: newOrder,
    };

    // Panggil API untuk update order siswa
    this.updateStudentOrder(studentUuid, requestData);

    // Tampilkan informasi student_uuid dan posisi baru
    console.log('Student UUID:', studentUuid);
    console.log('New position after drop:', currentIndex + 1);
  }

  updateStudentOrder(studentUuid: string, requestData: { new_order: number }) {
    // Log data yang akan dikirimkan
    console.log('Student UUID:', studentUuid); // Log studentUuid
    console.log('Request Data:', JSON.stringify(requestData, null, 2)); // Log requestData dalam format JSON yang mudah dibaca

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

        // Get all free students or other actions as needed
        // this.getAllFreeStudent();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }
}
