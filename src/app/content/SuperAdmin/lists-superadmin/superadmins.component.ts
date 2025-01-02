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
import { HeaderComponent } from '@layouts/header/header.component';
import { AsteriskComponent } from '@shared/components/asterisk/asterisk.component';
import { RequiredCommonComponent } from '@shared/components/required-common/required-common.component';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

// SHARED
import { Response, Superadmin } from '@core/interfaces';
import { TimeDateFormatPipe } from '@shared/pipes/time-date-format.pipe';
import { ToastService } from '@core/services/toast/toast.service';

import { toastInOutAnimation } from '@shared/utils/toast.animation';
import { modalScaleAnimation } from '@shared/utils/modal.animation';

@Component({
  selector: 'app-superadmins',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    AgGridAngular,
    AsteriskComponent,
    RequiredCommonComponent,
    SpinnerComponent,
  ],
  templateUrl: './superadmins.component.html',
  styleUrl: './superadmins.component.css',
  animations: [toastInOutAnimation, modalScaleAnimation],
})
export class SuperadminsComponent implements OnInit {
  token: string | null = '';

  sortBy: string = 'user_id';
  sortDirection: string = 'asc';

  paginationPage: number = 1;
  paginationCurrentPage: number = 1;
  paginationItemsLimit: number = 10;
  paginationTotalPage: number = 0;
  showing: string = '';
  pages: number[] = [];

  user_uuid: string = '';
  user_username: string = '';
  user_first_name: string = '';
  user_last_name: string = '';
  user_gender: string = '';
  user_email: string = '';
  user_password: string = '';
  user_role: string = '';
  user_role_code: string = '';
  user_phone: string = '';
  user_address: string = '';
  user_status: string = '';

  initialAvatar: string = '';

  isLoading: boolean = false;
  isMobile = window.innerWidth <= 768;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;
  isModalDeleteOpen: boolean = false;

  rowListAllUser: Superadmin[] = [];

  columnMapping: { [key: string]: string } = {
    'user_details.user_first_name': 'user_first_name',
    'user_details.user_last_name': 'user_last_name',
    user_username: 'user_username',
  };

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
    this.getAllSuperadmin();
    window.addEventListener('resize', this.updateIsMobile.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateIsMobile.bind(this));
  }

  updateIsMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    this.cdRef.detectChanges();
  }

  themeClass = 'ag-theme-quartz';

  gridOptions = {
    ensureDomOrder: true,
    pagination: true,
    paginationPageSizeSelector: [10, 20, 50, 100],
    suppressPaginationPanel: true,
    suppressMovable: true,
    onSortChanged: this.onSortChanged.bind(this),
    onGridReady: () => {
      console.log('Grid sudah siap!');
    },
  };

  colHeaderListAllUser: ColDef<Superadmin>[] = [
    {
      headerName: 'No.',
      valueGetter: (params: any) => {
        // Hitung nomor urut berdasarkan posisi pagination
        return (this.paginationPage - 1) * this.paginationItemsLimit + (params.node.rowIndex + 1);
      },  
      width: 50,
      maxWidth: 70,
      pinned: 'left',
      sortable: false,
    },
    {
      headerName: 'Username',
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
    { headerName: 'Email', field: 'user_email', maxWidth: 250 },
    {
      headerName: 'User Phone',
      field: 'user_details.user_phone',
      maxWidth: 250,
    },
    { headerName: 'User Status', field: 'user_status', maxWidth: 250 },
    {
      headerName: 'User Last Active',
      field: 'user_last_active',
      // valueFormatter: (params) => {
      //   if (!params.value || params.value === 'N/A') {
      //     return '-';
      //   }

      //   // Menggunakan custom pipe untuk memformat tanggal
      //   const formattedDate = this.timeDateFormatPipe.transform(params.value);
      //   return formattedDate ? formattedDate : '-';
      // },
      maxWidth: undefined,
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
          this.onDeleteSuperAdmin(params.data.user_uuid);
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
      this.getAllSuperadmin();
    }
  }


  goToNextPage() {
    if (this.paginationPage < this.paginationTotalPage) {
      this.paginationPage++;
      this.getAllSuperadmin();
    }
  }

  goToPreviousPage() {
    if (this.paginationPage > 1) {
      this.paginationPage--;
      this.getAllSuperadmin();
    }
  }

  changeMaxItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.paginationItemsLimit = +target.value;
    this.paginationPage = 1;
    this.getAllSuperadmin();
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
          this.sortBy = 'user_id';
          this.sortDirection = 'asc';
          this.columnClickCount[colId] = 0;
        } else {
          if (this.columnMapping[colId]) {
            this.sortBy = this.columnMapping[colId];
          } else {
            this.sortBy = colId;
          }

          if (this.columnClickCount[colId] === 1) {
            this.sortDirection = 'asc';
          } else if (this.columnClickCount[colId] === 2) {
            this.sortDirection = 'desc';
          }
        }
      });

      this.getAllSuperadmin();
    } else {
      console.error('onSortChanged: event.columns is undefined or empty');
    }
  }

  getAllSuperadmin() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/superadmin/user/sa/all`, {
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
        this.rowListAllUser = response.data.data.data;
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
    this.user_username = '';
    this.user_first_name = '';
    this.user_last_name = '';
    this.user_gender = '';
    this.user_email = '';
    this.user_password = '';
    this.user_phone = '';
    this.user_address = '';

    this.isModalAddOpen = true;
    this.cdRef.detectChanges()
  }

  addSuperadmin(): void {
    const requestData = {
      username: this.user_username,
      first_name: this.user_first_name,
      last_name: this.user_last_name,
      gender: this.user_gender,
      email: this.user_email,
      password: this.user_password,
      role: 'superadmin',
      phone: this.user_phone,
      address: this.user_address,
    };

    axios
      .post(`${this.apiUrl}/api/superadmin/user/add`, requestData, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.getAllSuperadmin();
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
  }

  openEditModal(user_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/sa/${user_uuid}`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        const editData = response.data.data;
        console.log('edit data', response);

        this.user_uuid = editData.user_uuid;
        this.user_username = editData.user_username;
        this.user_first_name = editData.user_details.user_first_name;
        this.user_last_name = editData.user_details.user_last_name;
        this.user_gender = editData.user_details.user_gender;
        this.user_email = editData.user_email;
        this.user_role = 'superadmin';
        this.user_phone = editData.user_details.user_phone;
        this.user_address = editData.user_details.user_address;

        this.initialAvatar =
          this.user_first_name.charAt(0).toUpperCase() +
          this.user_last_name.charAt(0).toUpperCase();

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
      username: this.user_username,
      first_name: this.user_first_name,
      last_name: this.user_last_name,
      gender: this.user_gender,
      email: this.user_email,
      password: this.user_password,
      role: 'superadmin',
      phone: this.user_phone,
      address: this.user_address,
    };

    console.log('uodate', data);

    axios
      .put(
        `${this.apiUrl}/api/superadmin/user/update/${this.user_uuid}`,
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

        this.getAllSuperadmin();

        this.isModalEditOpen = false;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  openDetailModal(user_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/sa/${user_uuid}`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        const detailData = response.data.data;

        this.user_uuid = detailData.user_uuid;
        this.user_username = detailData.user_username;
        this.user_first_name = detailData.user_details.user_first_name;
        this.user_last_name = detailData.user_details.user_last_name;
        this.user_gender = detailData.user_details.user_gender;
        this.user_email = detailData.user_email;
        this.user_role = 'superadmin';
        this.user_phone = detailData.user_details.user_phone;
        this.user_address = detailData.user_details.user_address;

        this.initialAvatar =
          this.user_first_name.charAt(0).toUpperCase() +
          this.user_last_name.charAt(0).toUpperCase();

        this.isModalDetailOpen = true;
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

  closeDetailModal() {
    this.isModalDetailOpen = false;
    this.cdRef.detectChanges();
  }

  onDeleteSuperAdmin(user_uuid: string) {
    this.isModalDeleteOpen = true;
    this.cdRef.detectChanges();

    this.user_uuid = user_uuid;
  }

  closeDeleteModal() {
    this.isModalDeleteOpen = false;
    this.cdRef.detectChanges();
  }

  performDeleteSuperAdmin(user_uuid: string) {
    axios
      .delete(`${this.apiUrl}/api/superadmin/user/sa/delete/${user_uuid}`, {
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

        this.getAllSuperadmin();
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

  showToast(message: string, duration: number, type: Response) {
    this.toastService.add(message, duration, type);
  }

  removeToast(index: number) {
    this.toastService.remove(index);
  }
}
