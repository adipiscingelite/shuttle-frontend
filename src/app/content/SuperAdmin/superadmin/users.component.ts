import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, ICellRendererParams } from 'ag-grid-community';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { HeaderComponent } from '../../../navigations/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  password: string;
  role: string;
  role_code: string;
  phone: string;
  address: string;
  status: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  token: string | null = '';

  totalRows: number = 0;
  startRow: number = 1;
  endRow: number = 10;

  id: string = '';
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

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;

  rowListAllUser: User[] = [];

  constructor(
    private cookieService: CookieService,
    private cdRef: ChangeDetectorRef,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
  }

  ngOnInit(): void {
    this.getAllSuperadmin();
  }

  themeClass = 'ag-theme-quartz';

  gridOptions = {
    ensureDomOrder: true,
    // enableAccessibility: true,
    pagination: true,
    paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50, 100],
  };

  colHeaderListAllUser: ColDef<User>[] = [
    {
      headerName: 'No.',
      valueGetter: 'node.rowIndex + 1',
      width: 50,
      maxWidth: 70,
      pinned: 'left',
    },
    { headerName: 'First Name', field: 'first_name', pinned: 'left' },
    { headerName: 'Last Name', field: 'last_name' },
    { headerName: 'Gender', field: 'gender', cellClass: 'capitalize' },
    { headerName: 'Email', field: 'email' },
    { headerName: 'Role', field: 'role', cellClass: 'capitalize' },
    // { headerName: 'Role Code', field: 'role_code' },
    { field: 'phone' },
    { field: 'address' },
    { field: 'status' },
    {
      headerName: 'Actions',
      cellRenderer: (params: ICellRendererParams) => {
        const button = document.createElement('button');
        button.innerText = 'Edit';
        button.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7"></path>
          <path d="M7 13.36V17h3.659L21 6.654 17.348 3 7 13.36Z"></path>
        </svg>
      `;
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          this.openEditModal(params.data.id);
        });
        return button;
      },
      pinned: 'right',
    },
  ];

  defaultColDef: ColDef = {
    flex: 1,
    width: 130,
    minWidth: 120,
    maxWidth: 250,
    wrapHeaderText: true,
    autoHeaderHeight: true,
  };

  // rowData: User[] = [
  //   {
  //     id: '1',
  //     first_name: 'John',
  //     last_name: 'Doe',
  //     email: 'john.doe@example.com',
  //     password: 'password123',
  //     role: 'admin',
  //     role_code: 'ADM001',
  //     phone: '123-456-7890',
  //     address: '123 Main St, Springfield',
  //     status: 'Active',
  //   },
  //   {
  //     id: '2',
  //     first_name: 'Jane',
  //     last_name: 'Smith',
  //     email: 'jane.smith@example.com',
  //     password: 'securePass!456',
  //     role: 'user',
  //     role_code: 'USR002',
  //     phone: '987-654-3210',
  //     address: '456 Elm St, Metropolis',
  //     status: 'Inactive',
  //   },
  //   {
  //     id: '3',
  //     first_name: 'Alice',
  //     last_name: 'Johnson',
  //     email: 'alice.johnson@example.com',
  //     password: 'alicePassword789',
  //     role: 'moderator',
  //     role_code: 'MOD003',
  //     phone: '555-123-4567',
  //     address: '789 Oak St, Gotham',
  //     status: 'Active',
  //   },
  //   {
  //     id: '4',
  //     first_name: 'Bob',
  //     last_name: 'Brown',
  //     email: 'bob.brown@example.com',
  //     password: 'bobSecurePassword456',
  //     role: 'editor',
  //     role_code: 'EDT004',
  //     phone: '444-567-8901',
  //     address: '101 Maple St, Star City',
  //     status: 'Pending',
  //   },
  //   {
  //     id: '5',
  //     first_name: 'Eve',
  //     last_name: 'Davis',
  //     email: 'eve.davis@example.com',
  //     password: 'eveSecretPass!123',
  //     role: 'admin',
  //     role_code: 'ADM005',
  //     phone: '333-789-0123',
  //     address: '202 Pine St, Central City',
  //     status: 'Inactive',
  //   },
  //   {
  //     id: '1',
  //     first_name: 'John',
  //     last_name: 'Doe',
  //     email: 'john.doe@example.com',
  //     password: 'password123',
  //     role: 'admin',
  //     role_code: 'ADM001',
  //     phone: '123-456-7890',
  //     address: '123 Main St, Springfield',
  //     status: 'Active',
  //   },
  //   {
  //     id: '2',
  //     first_name: 'Jane',
  //     last_name: 'Smith',
  //     email: 'jane.smith@example.com',
  //     password: 'securePass!456',
  //     role: 'user',
  //     role_code: 'USR002',
  //     phone: '987-654-3210',
  //     address: '456 Elm St, Metropolis',
  //     status: 'Inactive',
  //   },
  //   {
  //     id: '3',
  //     first_name: 'Alice',
  //     last_name: 'Johnson',
  //     email: 'alice.johnson@example.com',
  //     password: 'alicePassword789',
  //     role: 'moderator',
  //     role_code: 'MOD003',
  //     phone: '555-123-4567',
  //     address: '789 Oak St, Gotham',
  //     status: 'Active',
  //   },
  //   {
  //     id: '4',
  //     first_name: 'Bob',
  //     last_name: 'Brown',
  //     email: 'bob.brown@example.com',
  //     password: 'bobSecurePassword456',
  //     role: 'editor',
  //     role_code: 'EDT004',
  //     phone: '444-567-8901',
  //     address: '101 Maple St, Star City',
  //     status: 'Pending',
  //   },
  //   {
  //     id: '5',
  //     first_name: 'Eve',
  //     last_name: 'Davis',
  //     email: 'eve.davis@example.com',
  //     password: 'eveSecretPass!123',
  //     role: 'admin',
  //     role_code: 'ADM005',
  //     phone: '333-789-0123',
  //     address: '202 Pine St, Central City',
  //     status: 'Inactive',
  //   },
  // ];

  totalRowCount(event: any) {
    const api = event.api;
    const totalRows = api.getDisplayedRowCount();
    const currentPage = api.paginationGetCurrentPage();
    const pageSize = api.paginationGetPageSize();

    this.totalRows = totalRows;
    this.startRow = currentPage * pageSize + 1;
    this.endRow = Math.min((currentPage + 1) * pageSize, this.totalRows);

    event.api.refreshCells();
  }

  getAllSuperadmin() {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/sa/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllUser = response.data;
        console.log('ini nat', response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  openAddModal() {
    this.isModalAddOpen = true;
  }

  addSuperadmin(): void {
    const requestDataFormDA = {
      first_name: this.first_name,
      last_name: this.last_name,
      gender: this.gender,
      email: this.email,
      password: this.password,
      role: 'superadmin',
      phone: this.phone,
      address: this.address,
    };

    axios
      .post(`${this.apiUrl}/api/superadmin/user/add`, requestDataFormDA, {
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

        this.getAllSuperadmin();
      })
      .catch((error) => {
        console.log(error.response.data.message);
        if (
          error.response.status === 401 ||
          error.response.status === 500 ||
          error.response.status === 400
        ) {
          Swal.fire({
            icon: 'error',
            title: 'ERROR',
            text: error.response.data.message,
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
      });
    this.isModalAddOpen = false;
  }

  closeAddModal() {
    this.isModalAddOpen = false;
  }

  openEditModal(id: string) {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/sa/${id}`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        const formData = response.data;
        console.log('edit', response.data);

        this.id = formData.id;
        this.first_name = formData.first_name;
        this.last_name = formData.last_name;
        this.gender = formData.gender;
        this.email = formData.email;
        this.password = formData.password;
        this.role = 'superadmin';
        this.phone = formData.phone;
        this.address = formData.address;

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

  updateSuperadmin() {
    const data = {
      first_name: this.first_name,
      last_name: this.last_name,
      gender: this.gender,
      email: this.email,
      role: 'superadmin',
      phone: this.phone,
      address: this.address,
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

        // Debug perubahan data
        console.log('Update berhasil. Memuat ulang data...');
        this.getAllSuperadmin();
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

    this.isModalEditOpen = false;
    this.cdRef.detectChanges();
  }
}
