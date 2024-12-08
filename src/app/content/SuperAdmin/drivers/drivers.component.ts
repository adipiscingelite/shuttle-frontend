import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { HeaderComponent } from '../../../navigations/header/header.component';
import { AgGridAngular } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsteriskComponent } from '../../shared/asterisk/asterisk.component';
import { RequiredCommonComponent } from '../../shared/required-common/required-common.component';
import { Vehicle } from '../vehicles/vehicles.component';

interface Driver {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
  role_code: string;
  phone: string;
  address: string;
  status: string;
  last_active: string;
  details: Detail;
}

interface Detail {
  vehicle_id: string;
  license_number: string;
}

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [
    AsteriskComponent,
    RequiredCommonComponent,
    CommonModule,
    AgGridAngular,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.css',
})
export class DriversComponent implements OnInit {
  token: string | null = '';

  totalRows: number = 0;
  startRow: number = 1;
  endRow: number = 10;

  id: string = '';
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

  vehicle_id: string = '';
  license_number: string = '';

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDeleteOpen: boolean = false;

  rowListAllDriver: Driver[] = [];
  rowListAllVehicle: Vehicle[] = [];

  constructor(
    private cookieService: CookieService,
    private cdRef: ChangeDetectorRef,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
  }

  ngOnInit(): void {
    this.getAllVehicle();
    this.getAllDriver();
  }

  themeClass = 'ag-theme-quartz';

  gridOptions = {
    ensureDomOrder: true,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50, 100],
  };

  colHeaderListAllDriver: ColDef<Driver>[] = [
    {
      headerName: 'No.',
      valueGetter: 'node.rowIndex + 1',
      width: 50,
      maxWidth: 70,
      pinned: 'left',
      sortable: false,
    },
    { headerName: 'Username', field: 'username' },
    { headerName: 'First Name', field: 'first_name' },
    { headerName: 'Last Name', field: 'last_name' },
    { headerName: 'Email', field: 'email' },
    { field: 'phone' },
    { field: 'address' },
    { field: 'details.vehicle_id' },
    { field: 'status' },
    { field: 'last_active' },
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
          this.openEditModal(params.data.id);
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
          this.openViewModal(params.data.id);
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
          this.onDeleteDriver(params.data.id);
        });

        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(viewButton);
        buttonContainer.appendChild(deleteButton);

        return buttonContainer;
      },
      pinned: 'right',
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

  onPaginationChanged(event: any) {
    const currentPage = event.api.paginationGetCurrentPage() + 1;
    const pageSize = event.api.paginationGetPageSize();

    this.totalRowCount(currentPage, pageSize);
  }

  getAllVehicle() {
    axios
      .get(`${this.apiUrl}/api/superadmin/vehicle/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllVehicle = response.data;

        console.log('vehicle', this.rowListAllVehicle);

        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  getAllDriver() {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/driver/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllDriver = response.data;

        console.log('drivers', this.rowListAllDriver);

        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  openAddModal() {
    this.isModalAddOpen = true;
    this.cdRef.detectChanges();
  }

  addDriver(): void {
    const requestData = {
      first_name: this.first_name,
      last_name: this.last_name,
      gender: this.gender,
      email: this.email,
      password: this.password,
      role: 'driver',
      phone: this.phone,
      address: this.address,
      details: {
        license_number: this.license_number,
        vehicle_id: this.vehicle_id,
      },
    };

    console.log('driver add', requestData);

    axios
      .post(`${this.apiUrl}/api/superadmin/user/add`, requestData, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        Swal.fire({
          icon: 'success',
          title: 'SUCCESS',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });

        this.getAllDriver();

        this.isModalAddOpen = false;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'ERROR',
          text: error.response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      });
  }

  closeAddModal() {
    this.isModalAddOpen = false;
    this.cdRef.detectChanges();
  }

  openEditModal(id: string) {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/driver/${id}`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        const editData = response.data;

        this.id = editData.id;
        this.first_name = editData.first_name;
        this.last_name = editData.last_name;
        this.gender = editData.gender;
        this.email = editData.email;
        this.password = editData.password;
        this.role = 'driver';
        this.phone = editData.phone;
        this.address = editData.address;
        this.license_number = editData.details.license_number;
        this.vehicle_id = editData.details.vehicle_id;

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

  closeEditModal() {
    this.isModalEditOpen = false;
    this.cdRef.detectChanges();
  }

  updateDriver() {
    const data = {
      first_name: this.first_name,
      last_name: this.last_name,
      gender: this.gender,
      email: this.email,
      role: 'driver',
      phone: this.phone,
      address: this.address,
      details: {
        license_number: this.license_number,
        vehicle_id: this.vehicle_id,
      },
    };

    axios
      .put(`${this.apiUrl}/api/superadmin/user/update/${this.id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        Swal.fire({
          icon: 'success',
          title: 'SUCCESS',
          text: response.data.message,
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });

        this.getAllDriver();
        this.isModalEditOpen = false;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error saat update:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Unknown error',
          icon: 'error',
          timer: 2000,
          timerProgressBar: true,
          showCancelButton: false,
          showConfirmButton: false,
        });
      });
  }

  onDeleteDriver(id: string) {
    this.isModalDeleteOpen = true;
    this.cdRef.detectChanges();

    this.id = id;
  }

  closeDeleteModal() {
    this.isModalDeleteOpen = false;
    this.cdRef.detectChanges();
  }

  performDeleteDriver(id: string) {
    axios
      .delete(`${this.apiUrl}/api/superadmin/user/delete/${id}`, {
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

        this.getAllDriver();
        this.isModalDeleteOpen = false;

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
}
