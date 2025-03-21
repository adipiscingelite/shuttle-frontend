import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {
  _isAnimateRows,
  ColDef,
  GridOptions,
  ICellRendererParams,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as L from 'leaflet';

import { HeaderComponent } from '@layouts/header/header.component';
import { AsteriskComponent } from '@shared/components/asterisk/asterisk.component';
import { RequiredCommonComponent } from '@shared/components/required-common/required-common.component';

import { Response } from '@core/interfaces';
import { TimeDateFormatPipe } from '@shared/pipes/time-date-format.pipe';
import { ToastService } from '@core/services/toast/toast.service';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

import { toastInOutAnimation } from '@shared/utils/toast.animation';
import { modalScaleAnimation } from '@shared/utils/modal.animation';

interface Student {
  student_uuid: string;
  parent: Parent;
  school: schoolDetail;
  student_first_name: string;
  student_last_name: string;
  student_gender: string;
  student_grade: string;
  student_address: string;
  student_pickup_point: string;
  student_pickup_latitude: number;
  student_pickup_longitude: number;
  parent_name: string;
  student_status: string;
}

interface Parent {
  parent_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  gender: string;
  phone: string;
  address: string;
}

interface schoolDetail {
  school_id: string;
  school_name: string;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [
    AgGridAngular,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular,
    AsteriskComponent,
    RequiredCommonComponent,
    SpinnerComponent,
  ],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css',
  animations: [toastInOutAnimation, modalScaleAnimation],
})
export class StudentsComponent implements OnInit {
  token: string | null = '';

  sortBy: string = 'student_id';
  sortDirection: string = 'asc';

  paginationPage: number = 1;
  paginationCurrentPage: number = 1;
  paginationItemsLimit: number = 10;
  paginationTotalPage: number = 0;
  showing: string = '';
  pages: number[] = [];

  totalRows: number = 0;
  startRow: number = 1;
  endRow: number = 10;

  student_uuid: string = '';
  student_first_name: string = '';
  student_last_name: string = '';
  student_gender: string = '';
  student_grade: string = '';
  student_address: string = '';
  student_status: string = '';
  student_pickup_point: string = '';
  student_pickup_latitude: number | null = null;
  student_pickup_longitude: number | null = null;

  googleMapUrl: string = '';

  parent_uuid: string = '';
  parent_name: string = '';
  parent_username: string = '';
  parent_first_name: string = '';
  parent_last_name: string = '';
  parent_email: string = '';
  parent_password: string = '';
  parent_role: string = '';
  parent_gender: string = '';
  parent_phone: string = '';
  parent_address: string = '';

  initialAvatar: string = '';

  isLoading: boolean = false;
  isMobile = window.innerWidth <= 768;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;
  isModalDeleteOpen: boolean = false;

  //Row list data parrent and school
  rowListAllSchool: schoolDetail[] = [];

  rowListAllStudent: Student[] = [];

  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  private watchId: number | undefined;

  private columnClickCount: { [key: string]: number } = {};

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
    this.getAllStudent();
  }

  themeClass = 'ag-theme-quartz';

  gridOptions = {
    ensureDomOrder: true,
    pagination: true,

    paginationPageSizeSelector: [10, 20, 50, 100],
    suppressPaginationPanel: true,
    suppressMovableColumns: true,
    onSortChanged: this.onSortChanged.bind(this),
    onGridReady: () => {
      console.log('Grid sudah siap!');
    },
  };

  colHeaderListStudent: ColDef<Student>[] = [
    {
      headerName: 'No.',
      valueGetter: 'node.rowIndex + 1',
      width: 50,
      maxWidth: 70,
      pinned: 'left',
      sortable: false,
    },
    {
      headerName: 'First Name',
      field: 'student_first_name',
      maxWidth: 250,
      sortable: true,
    },
    {
      headerName: 'Last Name',
      field: 'student_last_name',
      maxWidth: 250,
      sortable: true,
    },
    {
      headerName: 'Parrent',
      field: 'parent_name',
      maxWidth: 250,
      sortable: true,
    },
    {
      headerName: 'Gender',
      field: 'student_gender',
      maxWidth: 250,
      sortable: true,
      valueFormatter: (params) => {
        return params.value
          ? params.value.charAt(0).toUpperCase() +
              params.value.slice(1).toLowerCase()
          : '';
      },
    },
    {
      headerName: 'Class',
      field: 'student_grade',
      maxWidth: 250,
      sortable: true,
    },
    {
      headerName: 'Address',
      field: 'student_address',
      maxWidth: 290,
      sortable: true,
    },
    {
      headerName: 'Attendance Status',
      field: 'student_status',
      sortable: true,
      cellRenderer: (params: any) => {
        const status = params.value;
        let statusColor = '';
        let bgColor = '';

        switch (status.toLowerCase()) {
          case 'present':
            statusColor = 'text-green-500';
            bgColor = 'bg-green-100';
            break;
          case 'sick':
            statusColor = 'text-red-500';
            bgColor = 'bg-red-100';
            break;
          case 'excused':
            statusColor = 'text-red-500';
            bgColor = 'bg-red-100';
            break;
          default:
            statusColor = 'text-gray-500';
            bgColor = 'bg-gray-100';
        }

        return `<span class="${statusColor} capitalize font-semibold px-3 py-1 ${bgColor} rounded-full">${status}</span>`;
      },
    },

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
          this.openEditModal(params.data.student_uuid);
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
          this.openDetailModal(params.data.student_uuid);
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
          this.onDeleteStudent(params.data.student_uuid);
        });

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(viewButton);
        buttonContainer.appendChild(deleteButton);

        return buttonContainer;
      },
      pinned: this.isMobile ? null : 'right',
    },
  ];

  defaultColDef: ColDef = {
    flex: 1,
    width: 130,
    minWidth: 120,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    sortable: false,
  };

  totalRowCount(currentPage: number, pageSize: number) {
    if (this.rowListAllStudent && this.rowListAllStudent.length > 0) {
      const totalRows = this.rowListAllStudent.length;
      this.totalRows = totalRows;

      this.startRow = (currentPage - 1) * pageSize + 1;
      this.endRow = Math.min(currentPage * pageSize, this.totalRows);
    } else {
      this.totalRows = 0;
      this.startRow = 0;
      this.endRow = 0;
    }
  }

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
      this.getAllStudent();
    }
  }

  goToNextPage() {
    if (this.paginationPage < this.paginationTotalPage) {
      this.paginationPage++;
      this.getAllStudent();
    }
  }

  goToPreviousPage() {
    if (this.paginationPage > 1) {
      this.paginationPage--;
      this.getAllStudent();
    }
  }

  changeMaxItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.paginationItemsLimit = +target.value;
    this.paginationPage = 1;
    this.getAllStudent();
  }

  onSortChanged(event: any) {
    if (event && event.columns && event.columns.length > 0) {
      event.columns.forEach((column: any) => {
        const colId = column.colId;
      });

      this.getAllStudent();
    } else {
      console.error('onSortChanged: event.columns is undefined or empty');
    }
  }

  getAllSchool() {
    axios
      .get(`${this.apiUrl}/api/school/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllSchool = response.data;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  getAllStudent() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/school/student/all`, {
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
        this.rowListAllStudent = response.data.data.data;
        this.paginationTotalPage = response.data.data.meta.total_pages;
        this.pages = Array.from(
          { length: this.paginationTotalPage },
          (_, i) => i + 1,
        );
        this.showing = response.data.data.meta.showing;

        this.isLoading = false;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      });
  }

  openAddModal() {
    this.student_uuid = '';
    this.student_first_name = '';
    this.student_last_name = '';
    this.student_gender = '';
    this.student_grade = '';
    this.student_address = '';
    this.student_pickup_point = '';
    this.student_pickup_latitude = null;
    this.student_pickup_longitude = null;

    this.googleMapUrl = '';

    this.parent_uuid = '';
    this.parent_name = '';
    this.parent_username = '';
    this.parent_first_name = '';
    this.parent_last_name = '';
    this.parent_email = '';
    this.parent_password = '';
    this.parent_role = '';
    this.parent_gender = '';
    this.parent_phone = '';
    this.parent_address = '';

    this.isModalAddOpen = true;
    this.getCoordinateByMap();
  }

  addStudent() {
    const requestData = {
      student: {
        student_first_name: this.student_first_name,
        student_last_name: this.student_last_name,
        student_gender: this.student_gender,
        student_grade: this.student_grade,
        student_address: this.student_address,

        student_pickup_point: {
          latitude: this.student_pickup_latitude,
          longitude: this.student_pickup_longitude,
        },
      },
      parent: {
        username: this.parent_name,
        first_name: this.parent_first_name,
        last_name: this.parent_last_name,
        gender: this.parent_gender,
        role: 'parent',
        email: this.parent_email,
        password: this.parent_password,
        phone: this.parent_phone,
        address: this.parent_address,
      },
    };

    axios
      .post(`${this.apiUrl}/api/school/student/add`, requestData, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.getAllStudent();
        this.isModalAddOpen = false;
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  setParentAddressIfEmpty() {
    if (!this.parent_address) {
      this.parent_address = this.student_address;
    }
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  openEditModal(student_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/school/student/${student_uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const editData = response.data.data;

        this.student_uuid = editData.student_uuid;
        this.student_first_name = editData.student_first_name;
        this.student_last_name = editData.student_last_name;
        this.student_gender = editData.student_gender.toLowerCase();
        this.student_grade = editData.student_grade;
        this.student_address = editData.student_address;
        this.student_status = editData.student_status;

        const studentPickUpPoint = JSON.parse(editData.student_pickup_point);
        this.student_pickup_latitude = studentPickUpPoint.latitude;
        this.student_pickup_longitude = studentPickUpPoint.longitude;

        this.initialAvatar =
          this.student_first_name.charAt(0).toUpperCase() +
          this.student_last_name.charAt(0).toUpperCase();

        this.parent_name = editData.parent_name;
        this.parent_username = editData.parent_username;
        this.parent_first_name = editData.first_name;
        this.parent_last_name = editData.last_name;
        this.parent_gender = editData.gender;
        this.parent_email = editData.email;
        this.parent_phone = editData.parent_phone;
        this.parent_address = editData.address;

        this.isModalEditOpen = true;
        this.getCoordinateByMap();
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        Swal.fire({
          title: 'Error',
          text: error.response.data.message,
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      });
  }

  updateStudent() {
    const requestData = {
      student_first_name: this.student_first_name,
      student_last_name: this.student_last_name,
      student_gender: this.student_gender,
      student_grade: this.student_grade,
      student_address: this.student_address,
      student_status: this.student_status,
      student_pickup_point: {
        latitude: this.student_pickup_latitude,
        longitude: this.student_pickup_longitude,
      },
    };

    axios
      .put(
        `${this.apiUrl}/api/school/student/update/${this.student_uuid}`,
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

        this.getAllStudent();
        this.isModalEditOpen = false;
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

  openDetailModal(student_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/school/student/${student_uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const detailData = response.data.data;

        this.student_uuid = detailData.student_uuid;
        this.student_first_name = detailData.student_first_name;
        this.student_last_name = detailData.student_last_name;
        this.student_gender = detailData.student_gender;
        this.student_grade = detailData.student_grade;
        this.student_address = detailData.student_address;

        const studentPickUpPoint = JSON.parse(detailData.student_pickup_point);
        this.student_pickup_latitude = studentPickUpPoint.latitude;
        this.student_pickup_longitude = studentPickUpPoint.longitude;

        this.initialAvatar =
          this.student_first_name.charAt(0).toUpperCase() +
          this.student_last_name.charAt(0).toUpperCase();

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

  onDeleteStudent(student_uuid: string) {
    this.isModalDeleteOpen = true;
    this.student_uuid = student_uuid;
    this.cdRef.detectChanges();
  }

  closeDeleteModal() {
    this.isModalDeleteOpen = false;
    this.cdRef.detectChanges();
  }

  performDeleteStudent(student_uuid: string) {
    axios
      .delete(`${this.apiUrl}/api/school/student/delete/${student_uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.getAllStudent();
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
      this.student_pickup_latitude = parseFloat(match[1]);
      this.student_pickup_longitude = parseFloat(match[2]);
    } else {
      const responseMessage = 'Invalid Google Maps URL';
      this.showToast(responseMessage, 3000, Response.Error);
    }
  }

  private getCoordinateByMap(): void {
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

          if (this.marker) {
            this.marker.setLatLng([clickedLat, clickedLng]);
          } else {
            this.marker = L.marker([clickedLat, clickedLng]).addTo(this.map!);
          }

          this.student_pickup_latitude = clickedLat;
          this.student_pickup_longitude = clickedLng;
        });

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
  }
}
