// ANGULAR
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// THIRD-PARTY LIBRARIES
import axios from 'axios';
import Swal from 'sweetalert2';
import { CookieService } from 'ngx-cookie-service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import * as L from 'leaflet';

// COMPONENTS
import { HeaderComponent } from '@layouts/header/header.component';
import { AsteriskComponent } from '@shared/components/asterisk/asterisk.component';
import { RequiredCommonComponent } from '@shared/components/required-common/required-common.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

// SHARED
import { Response, School } from '@core/interfaces';

import { ToastService } from '@core/services/toast/toast.service';

import { toastInOutAnimation } from '@shared/utils/toast.animation';
import { modalScaleAnimation } from '@shared/utils/modal.animation';

@Component({
  selector: 'app-schools',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular,
    AsteriskComponent,
    RequiredCommonComponent,
    SpinnerComponent,
  ],
  templateUrl: './schools.component.html',
  styleUrl: './schools.component.css',
  animations: [toastInOutAnimation, modalScaleAnimation],
})
export class SchoolsComponent implements OnInit {
  token: string | null = '';

  sortBy: string = 'school_id';
  sortDirection: string = 'asc';

  paginationPage: number = 1;
  paginationCurrentPage: number = 1;
  paginationItemsLimit: number = 10;
  paginationTotalPage: number = 0;
  showing: string = '';
  pages: number[] = [];

  school_uuid: string = '';
  school_name: string = '';
  school_address: string = '';
  school_contact: string = '';
  school_email: string = '';
  school_description: string = '';

  school_latitude: number | null = null;
  school_longitude: number | null = null;

  // for map
  googleMapUrl: string = '';

  isLoading: boolean = false;
  isMobile = window.innerWidth <= 768;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;
  isModalDeleteOpen: boolean = false;

  rowListAllSchool: School[] = [];

  private columnClickCount: { [key: string]: number } = {};

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private watchId: number | undefined;

  constructor(
    private cookieService: CookieService,
    private cdRef: ChangeDetectorRef,
    public toastService: ToastService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
  }

  ngOnInit(): void {
    this.getAllSchool();
  }

  themeClass = 'ag-theme-quartz';

  gridOptions = {
    ensureDomOrder: true,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50, 100],
    suppressPaginationPanel: true,
    suppressMovable: true,
    onSortChanged: this.onSortChanged.bind(this),
    onGridReady: () => {
      console.log('Grid sudah siap!');
    },
  };

  colHeaderListAllSchool: ColDef<School>[] = [
    {
      headerName: 'No.',
      valueGetter: (params: any) => {
        // Hitung nomor urut berdasarkan posisi pagination
        return (
          (this.paginationPage - 1) * this.paginationItemsLimit +
          (params.node.rowIndex + 1)
        );
      },
      width: 50,
      maxWidth: 70,
      pinned: 'left',
    },
    { headerName: 'School Name', field: 'school_name', sortable: true },
    { headerName: 'School Address', field: 'school_address' },
    { headerName: 'School Phone', field: 'school_contact' },
    { headerName: 'School Email', field: 'school_email' },
    // { field: 'school_description' },
    {
      headerName: 'Actions',
      headerClass: 'justify-center',
      cellStyle: { textAlign: 'center' },
      sortable: false,
      autoHeight: true,
      cellRenderer: (params: ICellRendererParams) => {
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add(
          'flex',
          'items-center',
          'justify-center',
          'py-2',
          'gap-x-1',
        );

        const editButton = document.createElement('button');
        editButton.innerText = 'Edit';
        editButton.title = 'Click to Edit';
        editButton.classList.add('hover:bg-white', 'p-1', 'rounded-full');
        editButton.innerHTML = `
      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="m7 17.011 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414 0-.534-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.581v4.43ZM18.045 4.456l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58ZM9 13.416l6.03-5.974 1.586 1.586L10.587 15 9 15.004v-1.589Z"></path>
        <path d="M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2Z"></path>
      </svg>
        `;
        editButton.addEventListener('click', (event) => {
          event.stopPropagation();
          this.openEditModal(params.data.school_uuid);
        });

        const viewButton = document.createElement('button');
        viewButton.innerText = 'View';
        viewButton.title = 'Click to View';
        viewButton.classList.add('hover:bg-white', 'p-1', 'rounded-full');
        viewButton.innerHTML = `
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2Zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8Z"></path>
          <path d="M11 11h2v6h-2v-6Zm0-4h2v2h-2V7Z"></path>
        </svg>
        `;
        viewButton.addEventListener('click', (event) => {
          event.stopPropagation();
          this.openDetailModal(params.data.school_uuid);
        });

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Delete';
        deleteButton.title = 'Click to Delete';
        deleteButton.classList.add(
          'text-red-500',
          'hover:bg-white',
          'p-1',
          'rounded-full',
        );
        deleteButton.innerHTML = `
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2v12ZM9 4h6v2H9V4ZM8 8h9v12H7V8h1Z"></path>
            <path d="M9 10h2v8H9v-8Zm4 0h2v8h-2v-8Z"></path>
          </svg>
        `;
        deleteButton.addEventListener('click', (event) => {
          event.stopPropagation();
          this.onDeleteSchool(params.data.school_uuid);
        });

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(viewButton);
        buttonContainer.appendChild(deleteButton);

        return buttonContainer;
      },
      pinned: this.isMobile ? null : 'right',
    },
  ];

  openViewModal(id: string) {}

  defaultColDef: ColDef = {
    flex: 1,
    width: 130,
    minWidth: 120,
    maxWidth: 250,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    sortable: false,
  };

  getVisiblePages(): (number | string)[] {
    const visiblePages: (number | string)[] = [];
    const totalPages = this.paginationTotalPage;
    const currentPage = this.paginationPage;

    visiblePages.push(1);

    if (totalPages <= 7) {
      for (let i = 2; i < totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        visiblePages.push(2, 3, 4, '...', totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        visiblePages.push(
          '...',
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
        );
      } else {
        visiblePages.push(
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
        );
      }
    }

    if (totalPages > 1) {
      visiblePages.push(totalPages);
    }

    return visiblePages;
  }

  goToPage(page: number | string) {
    if (
      typeof page === 'number' &&
      page >= 1 &&
      page <= this.paginationTotalPage
    ) {
      this.paginationPage = page;
      this.getAllSchool();
    }
  }

  goToNextPage() {
    if (this.paginationPage < this.paginationTotalPage) {
      this.paginationPage++;
      this.getAllSchool();
    }
  }

  goToPreviousPage() {
    if (this.paginationPage > 1) {
      this.paginationPage--;
      this.getAllSchool();
    }
  }

  changeMaxItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.paginationItemsLimit = +target.value;
    this.paginationPage = 1;
    this.getAllSchool();
  }

  onSortChanged(event: any) {
    console.log('onSortChanged event:', event);

    if (event && event.columns && event.columns.length > 0) {
      event.columns.forEach((column: any) => {
        const colId = column.colId;
        console.log('Sorting column ID:', colId);

        if (!this.columnClickCount[colId]) {
          this.columnClickCount[colId] = 0;
        }
        this.columnClickCount[colId] += 1;

        if (this.columnClickCount[colId] === 3) {
          this.sortBy = 'school_id';
          this.sortDirection = 'asc';
          this.columnClickCount[colId] = 0;
        }
      });

      this.getAllSchool();
    } else {
      console.error('onSortChanged: event.columns is undefined or empty');
    }
  }

  getAllSchool() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/superadmin/school/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
        params: {
          page: this.paginationPage,
          limit: this.paginationItemsLimit,

          sort_by: this.sortBy,
          direction: this.sortDirection,
        },
      })
      .then((response) => {
        this.rowListAllSchool = response.data.data.data;
        this.paginationTotalPage = response.data.data.meta.total_pages;
        this.pages = Array.from(
          { length: this.paginationTotalPage },
          (_, i) => i + 1,
        );
        this.showing = response.data.data.meta.showing;

        console.log(response);

        this.isLoading = false;

        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      });
  }

  openAddModal() {
    this.school_uuid = '';
    this.school_name = '';
    this.school_address = '';
    this.school_contact = '';
    this.school_email = '';
    this.school_description = '';
    this.school_latitude = null;
    this.school_longitude = null;

    this.isModalAddOpen = true;
    this.getCoordinateByMap();
    this.cdRef.detectChanges();
  }

  addSchool(): void {
    const requestDataFormDA = {
      name: this.school_name,
      address: this.school_address,
      contact: this.school_contact,
      email: this.school_email,
      description: this.school_description,
      point: {
        latitude: this.school_latitude,
        longitude: this.school_longitude,
      },
    };

    axios
      .post(`${this.apiUrl}/api/superadmin/school/add`, requestDataFormDA, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.getAllSchool();
        this.isModalAddOpen = false;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  openEditModal(id: string) {
    axios
      .get(`${this.apiUrl}/api/superadmin/school/${id}`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        const editData = response.data.data;
        console.log('school edit', editData);

        this.school_uuid = editData.school_uuid;
        this.school_name = editData.school_name;
        this.school_address = editData.school_address;
        this.school_contact = editData.school_contact;
        this.school_email = editData.school_email;
        this.school_description = editData.school_description;

        const school_point = JSON.parse(editData.school_point);

        this.school_latitude = school_point.latitude;
        this.school_longitude = school_point.longitude;

        this.isModalEditOpen = true;
        this.getCoordinateByMap();
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  closeEditModal() {
    this.isModalEditOpen = false;
    this.cdRef.detectChanges();
  }

  updateSchool() {
    const data = {
      name: this.school_name,
      address: this.school_address,
      contact: this.school_contact,
      email: this.school_email,
      description: this.school_description,
      point: {
        latitude: this.school_latitude,
        longitude: this.school_longitude,
      },
    };

    axios
      .put(
        `${this.apiUrl}/api/superadmin/school/update/${this.school_uuid}`,
        data,
        {
          headers: {
            Authorization: `${this.token}`,
          },
        },
      )
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.isModalEditOpen = false;
        this.cdRef.detectChanges();

        this.getAllSchool();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  openDetailModal(student_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/superadmin/school/${student_uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const detailData = response.data.data;

        this.school_uuid = detailData.school_uuid;
        this.school_name = detailData.school_name;
        this.school_address = detailData.school_address;
        this.school_contact = detailData.school_contact;
        this.school_email = detailData.school_email;
        this.school_description = detailData.school_description;

        const school_point = JSON.parse(detailData.school_point);

        this.school_latitude = school_point.latitude;
        this.school_longitude = school_point.longitude;

        this.isModalDetailOpen = true;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  closeDetailModal() {
    this.isModalDetailOpen = false;
    this.cdRef.detectChanges();
  }

  onDeleteSchool(school_uuid: string) {
    this.isModalDeleteOpen = true;
    this.cdRef.detectChanges();

    this.school_uuid = school_uuid;
  }

  closeDeleteModal() {
    this.isModalDeleteOpen = false;
    this.cdRef.detectChanges();
  }

  performDeleteSchool(school_uuid: string) {
    axios
      .delete(`${this.apiUrl}/api/superadmin/user/delete/${school_uuid}`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        Swal.fire({
          title: 'Success',
          text: response.data.message,
          icon: 'success',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });

        this.getAllSchool();
        this.isModalDeleteOpen = false;

        this.cdRef.detectChanges();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  showToast(message: string, duration: number, type: Response) {
    this.toastService.add(message, duration, type);
  }

  removeToast(index: number) {
    this.toastService.remove(index);
  }

  getCoordinateByUrl(): void {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = this.googleMapUrl.match(regex);

    if (match) {
      this.school_latitude = parseFloat(match[1]);
      this.school_longitude = parseFloat(match[2]);
    } else {
      const responseMessage = 'Invalid Google Maps URL';
      this.showToast(responseMessage, 3000, Response.Error);
    }
  }

  private getCoordinateByMap(): void {
    console.log('plis');

    // if ('geolocation' in navigator) {
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
        this.map = L.map('map').setView(
          [-7.76131921887155, 110.36293728044329],
          12,
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(this.map);

        this.map.on('click', (e: L.LeafletMouseEvent) => {
          const clickedLat = e.latlng.lat;
          const clickedLng = e.latlng.lng;

          // Update marker position
          if (this.marker) {
            this.marker.setLatLng([clickedLat, clickedLng]);
          } else {
            this.marker = L.marker([clickedLat, clickedLng]).addTo(this.map!);
          }

          // Update form inputs
          this.school_latitude = clickedLat;
          this.school_longitude = clickedLng;
        });
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
    // } else {
    //   const coordinatesElement = document.getElementById('coordinates');
    //   if (coordinatesElement) {
    //     coordinatesElement.textContent =
    //       'Geolocation is not supported by your browser.';
    //   }

    //   // Set loading status to false if geolocation is not supported
    //   this.isLoading = false;
    // }
  }
}
