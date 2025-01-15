// ANGULAR
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// THIRD-PARTY LIBRARIES
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

// COMPONENTS
import { AsteriskComponent } from '@shared/components/asterisk/asterisk.component';
import { RequiredCommonComponent } from '@shared/components/required-common/required-common.component';

// SHARED
import { Response } from '@core/interfaces';
import { ToastService } from '@core/services/toast/toast.service';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

import { toastInOutAnimation } from '@shared/utils/toast.animation';
import { modalScaleAnimation } from '@shared/utils/modal.animation';

interface Driver {
  user_uuid: string;
  user_username: string;
  email: string;
  password: string;
  role: string;
  role_code: string;
  user_status: string;
  user_last_active: string;
  user_details: UserDetail;
  license_number: string;
}

interface UserDetail {
  user_first_name: string;
  user_last_name: string;
  user_gender: string;
  user_address: string;
  school: schoolDetail;
  vehicle: vehicleDetail;
  user_phone: string;
}

interface schoolDetail {
  school_id: string;
  school_name: string;
}

interface vehicleDetail {
  vehicle_uuid: string;
  vehicle_name: string;
  vehicle_number: string;
}

@Component({
  selector: 'app-drivers',
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
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.css',
  animations: [toastInOutAnimation, modalScaleAnimation],
})
export class SchoolAdminDriversComponent implements OnInit {
  // For token
  token: string | null = '';
  // For sorting
  sortBy: string = 'user_id';
  sortDirection: string = 'asc';

  // For pagination
  paginationPage: number = 1;
  paginationCurrentPage: number = 1;
  paginationItemsLimit: number = 10;
  paginationTotalPage: number = 0;
  showing: string = '';
  pages: number[] = [];

  totalRows: number = 0;
  startRow: number = 1;
  endRow: number = 10;

  // For data drivers
  user_uuid: string = '';
  username: string = '';
  first_name: string = '';
  last_name: string = '';
  gender: string = '';
  email: string = '';
  password: string = '';
  role: string = '';
  role_code: string = '';
  phone: string = '';
  address: string = '';
  status: string = '';
  license_number: string = '';

  // For data school
  school_id: string = '';
  school_name: string = '';

  // For data vehicle
  vehicle_uuid: string = '';
  vehicle_name: string = '';
  vehicle_number: string = '';

  // For initial avatar
  initialAvatar: string = '';

  // For loading
  isLoading: boolean = false;
  isMobile = window.innerWidth <= 768;

  // For CRUD Modal
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;
  isModalDeleteOpen: boolean = false;

  // Row list data driver
  rowListAllDriver: Driver[] = [];

  // Row list data school
  rowListAllSchool: schoolDetail[] = [];

  // Row list data vehicle
  rowListAllVehicle: vehicleDetail[] = [];
  rowListAllFreeVehicle: vehicleDetail[] = [];

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
    this.getAllDriver();
    // this.getAllSchool();
    this.getAllVehicle();
    this.getAllFreeVehicle();
  }

  // Ag grid table displayed
  themeClass = 'ag-theme-quartz';

  gridOptions = {
    ensureDomOrder: true,
    pagination: true,
    paginationPageSizeSelector: [10, 20, 50, 100],
    suppressPaginationPanel: true,
    suppressMovableColumns: true,
    // penyesuaian request onSortChanged
    // onSortChanged: (event: any) => {
    //   this.onSortChanged(event);
    // },
    // onSortChanged: this.onSortChanged.bind(this),
    onGridReady: () => {
      console.log('Grid sudah siap!');
    },
  };

  // Column Definitions
  colHeaderListDriver: ColDef<Driver>[] = [
    {
      headerName: 'No.',
      valueGetter: 'node.rowIndex + 1',
      width: 50,
      maxWidth: 70,
      pinned: 'left',
      sortable: false,
    },
    {
      headerName: 'User Name',
      field: 'user_username',
      maxWidth: 250,
      sortable: true,
    },
    {
      headerName: 'First Name',
      field: 'user_details.user_first_name',
      maxWidth: 250,
      sortable: true,
    },
    {
      headerName: 'Last Name',
      field: 'user_details.user_last_name',
      maxWidth: 250,
      sortable: true,
    },
    // { headerName: 'School',
    //   field: 'details.school.school_name',
    //   maxWidth: 250,
    //   sortable: true,
    // },
    {
      headerName: 'Gender',
      field: 'user_details.user_gender',
      maxWidth: 250,
      sortable: true,
    },
    {
      headerName: 'Address',
      field: 'user_details.user_address',
      maxWidth: 250,
      sortable: true,
    },
    // { headerName: 'License Number',
    //   field: 'license_number',
    //   maxWidth: 250,
    //   sortable: true,
    // },
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
          this.openEditModal(params.data.user_uuid);
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
          this.openDetailModal(params.data.user_uuid);
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
          this.onDeleteDriver(params.data.user_uuid);
        });

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(viewButton);
        buttonContainer.appendChild(deleteButton);

        return buttonContainer;
      },
      pinned: this.isMobile ? null : 'right',
    },
  ];

  // Default column definitions for consistency
  defaultColDef: ColDef = {
    flex: 1,
    width: 130,
    minWidth: 120,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    sortable: false,
  };

  totalRowCount(currentPage: number, pageSize: number) {
    if (this.rowListAllDriver && this.rowListAllDriver.length > 0) {
      const totalRows = this.rowListAllDriver.length;
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
      this.getAllDriver();
    }
  }

  goToNextPage() {
    if (this.paginationPage < this.paginationTotalPage) {
      this.paginationPage++;
      this.getAllDriver();
    }
  }

  goToPreviousPage() {
    if (this.paginationPage > 1) {
      this.paginationPage--;
      this.getAllDriver();
    }
  }

  changeMaxItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.paginationItemsLimit = +target.value;
    this.paginationPage = 1;
    this.getAllDriver();
  }

  onSortChanged(event: any) {
    console.log('onSortChanged event:', event);

    if (event && event.columns && event.columns.length > 0) {
      event.columns.forEach((column: any) => {
        const colId = column.colId;
        console.log('Sorting column ID:', colId);

        // if (!this.columnClickCount[colId]) {
        //   this.columnClickCount[colId] = 0;
        // }
        // this.columnClickCount[colId] += 1;

        // if (this.columnClickCount[colId] === 3) {
        //   this.sortBy = 'user_id';
        //   this.sortDirection = 'asc';
        //   this.columnClickCount[colId] = 0;
        // } else {
        //   if (this.columnMapping[colId]) {
        //     this.sortBy = this.columnMapping[colId];
        //   } else {
        //     this.sortBy = colId;
        //   }

        //   if (this.columnClickCount[colId] === 1) {
        //     this.sortDirection = 'asc';
        //   } else if (this.columnClickCount[colId] === 2) {
        //     this.sortDirection = 'desc';
        //   }
        // }
      });

      this.getAllDriver();
    } else {
      console.error('onSortChanged: event.columns is undefined or empty');
    }
  }

  // Get all schools
  // For fetching data school
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

  // Get all vehicles
  getAllVehicle() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/school/vehicle/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllVehicle = response.data.data.data;
        console.log('response', response);
        this.isLoading = false;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      });
  }

  // Get all vehicles
  getAllFreeVehicle() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/school/vehicle/free/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        console.log('response', response);
        this.rowListAllFreeVehicle = response.data.vehicles;
        console.log('ini', this.rowListAllFreeVehicle);

        this.isLoading = false;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
      });
  }

  // Get all drivers
  getAllDriver() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/school/user/driver/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllDriver = response.data.data.data;
        console.log('response', response);
        this.paginationTotalPage = response.data.data.meta.total_pages;
        this.pages = Array.from(
          { length: this.paginationTotalPage },
          (_, i) => i + 1,
        ); // Copy data
        this.showing = response.data.data.meta.showing;

        this.isLoading = false;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        this.isLoading = false;
        console.log(error);
      });
  }

  // Add driver
  openAddModal() {
    // For data drivers
    this.user_uuid = '';
    this.username = '';
    this.first_name = '';
    this.last_name = '';
    this.gender = '';
    this.email = '';
    this.password = '';
    this.role = '';
    this.role_code = '';
    this.phone = '';
    this.address = '';
    this.status = '';
    this.license_number = '';

    // For data school
    this.school_id = '';
    this.school_name = '';

    // For data vehicle
    this.vehicle_uuid = '';
    this.vehicle_name = '';
    this.vehicle_number = '';

    this.isModalAddOpen = true;
    this.cdRef.detectChanges();
  }

  addDriver() {
    const requestData = {
      username: this.username,
      first_name: this.first_name,
      last_name: this.last_name,
      gender: this.gender,
      email: this.email,
      password: this.password,
      role: 'driver',
      phone: this.phone,
      address: this.address,
      details: {
        school_id: this.school_id,
        license_number: this.license_number,
        vehicle_uuid: this.vehicle_uuid,
      },
    };
    console.log('requestData', requestData);

    axios
      .post(`${this.apiUrl}/api/school/user/driver/add`, requestData, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.getAllDriver();
        this.isModalAddOpen = false;
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  closeAddModal() {
    this.isModalAddOpen = false;
    this.cdRef.detectChanges();
  }

  openEditModal(user_uuid: string) {
    console.log('user_uuid', user_uuid);
    axios
      .get(`${this.apiUrl}/api/school/user/driver/${user_uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        console.log('edit', response);
        const editData = response.data.data;
        console.log('editData', editData);

        this.user_uuid = editData.user_uuid || '';
        this.username = editData.user_username || '';
        this.first_name = editData?.user_details?.user_first_name || '';
        this.last_name = editData?.user_details?.user_last_name || '';
        this.gender = editData?.user_details?.user_gender || '';
        this.email = editData.user_email || '';
        this.phone = editData?.user_details?.user_phone || '';
        this.address = editData?.user_details?.user_address || '';
        this.license_number = editData.user_details?.license_number || '';
        this.vehicle_uuid = editData?.user_details?.vehicle_uuid || '';

        this.initialAvatar =
          this.first_name.charAt(0).toUpperCase() +
          this.last_name.charAt(0).toUpperCase();

        this.isModalEditOpen = true;
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

  updateDriver() {
    const requestData = {
      username: this.username,
      first_name: this.first_name,
      last_name: this.last_name,
      gender: this.gender,
      email: this.email,
      password: this.password,
      role: 'driver',
      phone: this.phone,
      address: this.address,
      details: {
        school_id: this.school_id,
        license_number: this.license_number,
        vehicle_uuid: this.vehicle_uuid,
      },
    };

    axios
      .put(
        `${this.apiUrl}/api/school/user/driver/update/${this.user_uuid}`,
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

        this.getAllDriver();
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

  openDetailModal(user_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/school/user/driver/${user_uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const detailData = response.data.data;

        this.user_uuid = detailData.user_uuid || '';
        this.username = detailData.user_username || '';
        this.first_name = detailData?.user_details?.user_first_name || '';
        this.last_name = detailData?.user_details?.user_last_name || '';
        this.gender = detailData?.user_details?.user_gender || '';
        this.email = detailData.user_email || '';
        this.phone = detailData?.user_details?.user_phone || '';
        this.address = detailData?.user_details?.user_address || '';
        this.license_number = detailData.user_details?.license_number || '';
        this.vehicle_uuid = detailData?.user_details?.vehicle_uuid || '';

        this.initialAvatar =
          this.first_name.charAt(0).toUpperCase() +
          this.last_name.charAt(0).toUpperCase();

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

  onDeleteDriver(user_uuid: string) {
    this.isModalDeleteOpen = true;
    this.user_uuid = user_uuid;
    this.cdRef.detectChanges();
  }

  performDeleteDriver(user_uuid: string) {
    axios
      .delete(`${this.apiUrl}/api/school/user/driver/delete/${user_uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.getAllDriver();
        this.isModalDeleteOpen = false;
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  closeDeleteModal() {
    this.isModalDeleteOpen = false;
    this.cdRef.detectChanges();
  }

  showToast(message: string, duration: number, type: Response) {
    this.toastService.add(message, duration, type);
  }

  removeToast(index: number) {
    this.toastService.remove(index);
  }
}
