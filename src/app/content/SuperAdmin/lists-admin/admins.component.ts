// ANGULAR
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// THIRD PARTY
import { CookieService } from 'ngx-cookie-service';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import axios from 'axios';
import Swal from 'sweetalert2';

// COMPONENT
import { HeaderComponent } from '@layouts/header/header.component';
import { RequiredCommonComponent } from '@shared/components/required-common/required-common.component';
import { AsteriskComponent } from '@shared/components/asterisk/asterisk.component';

// SHARED
import { School, SchoolAdmin, Response } from '@core/interfaces';
import { ToastService } from '@core/services/toast/toast.service';

import { toastInOutAnimation } from '@shared/utils/toast.animation';
import { modalScaleAnimation } from '@shared/utils/modal.animation';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular,
    HeaderComponent,
    RequiredCommonComponent,
    AsteriskComponent,
    SpinnerComponent,
  ],
  templateUrl: './admins.component.html',
  styleUrl: './admins.component.css',
  animations: [toastInOutAnimation, modalScaleAnimation],
})
export class AdminsComponent implements OnInit {
  token: string | null = '';

  sortBy: string = 'user_id';
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

  school_uuid: string = '';
  school_name: string = '';

  isLoading: boolean = false;
  isMobile = window.innerWidth <= 768;

  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;
  isModalDeleteOpen: boolean = false;

  rowListAllSchool: School[] = [];
  rowListAllSchoolAdmin: SchoolAdmin[] = [];

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
    this.getAllSchool();
    this.getAllSchooladmin();
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
    // paginationPageSize: 10,
    paginationPageSizeSelector: [10, 20, 50, 100],
    suppressPaginationPanel: true,
    suppressMovable: true,
    onSortChanged: this.onSortChanged.bind(this),
    onGridReady: () => {
      console.log('Grid sudah siap!');
    },
  };

  colHeaderListAllSchoolAdmin: ColDef<SchoolAdmin>[] = [
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
      sortable: false,
    },
    {
      headerName: 'Username',
      field: 'user_username',
      sortable: true,
    },
    { headerName: 'First Name', field: 'user_details.user_first_name' },
    { headerName: 'Last Name', field: 'user_details.user_last_name' },
    { headerName: 'Email', field: 'user_email' },
    { headerName: 'Phone', field: 'user_details.user_phone' },
    // { headerName: 'Address', field: 'user_details.user_address' },
    { headerName: 'School Name', field: 'user_details.school_name' },
    { field: 'user_status', maxWidth: undefined },
    {
      headerName: 'Actions',
      sortable: false,
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
          this.onDeleteSchoolAdmin(params.data.user_uuid);
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
    maxWidth: 250,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    sortable: false,
  };

  totalRowCount(currentPage: number, pageSize: number) {
    if (this.rowListAllSchoolAdmin && this.rowListAllSchoolAdmin.length > 0) {
      const totalRows = this.rowListAllSchoolAdmin.length;
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
      this.getAllSchooladmin();
    }
  }

  goToNextPage() {
    if (this.paginationPage < this.paginationTotalPage) {
      this.paginationPage++;
      this.getAllSchooladmin();
    }
  }

  goToPreviousPage() {
    if (this.paginationPage > 1) {
      this.paginationPage--;
      this.getAllSchooladmin();
    }
  }

  changeMaxItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.paginationItemsLimit = +target.value;
    this.paginationPage = 1;
    this.getAllSchooladmin();
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

      this.getAllSchooladmin();
    } else {
      console.error('onSortChanged: event.columns is undefined or empty');
    }
  }

  getAllSchool() {
    axios
      .get(`${this.apiUrl}/api/superadmin/school/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllSchool = response.data.data.data;

        console.log(this.rowListAllSchool);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  getAllSchooladmin() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/superadmin/user/as/all`, {
        headers: {
          Authorization: `${this.token}`,
        },
        params: {
          page: this.paginationPage,
          limit: this.paginationItemsLimit,

          sort_by: this.sortBy,
          direction: this.sortDirection,
        },
      })
      .then((response) => {
        this.rowListAllSchoolAdmin = response.data.data.data;
        console.log(this.rowListAllSchoolAdmin);

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
  }

  addSchooladmin(): void {
    const requestData = {
      username: this.user_username,
      first_name: this.user_first_name,
      last_name: this.user_last_name,
      gender: this.user_gender,
      email: this.user_email,
      password: this.user_password,
      role: 'schooladmin',
      phone: this.user_phone,
      address: this.user_address,
      details: {
        school_uuid: this.school_uuid,
      },
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

        this.getAllSchooladmin();
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

  openEditModal(id: string) {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/as/${id}`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        console.log(id);

        const editData = response.data.data;
        console.log('res', editData);

        this.user_uuid = editData.user_uuid;
        this.user_username = editData.user_username;
        this.user_first_name = editData.user_details.user_first_name;
        this.user_last_name = editData.user_details.user_last_name;
        this.user_gender = editData.user_details.user_gender;
        this.user_email = editData.user_email;
        this.user_password = editData.user_password;
        this.user_role = 'superadmin';
        this.user_phone = editData.user_details.user_phone;
        this.user_address = editData.user_details.user_address;
        this.school_uuid = editData.user_details.school_uuid;

        this.initialAvatar =
          this.user_first_name.charAt(0).toUpperCase() +
          this.user_last_name.charAt(0).toUpperCase();

        this.isModalEditOpen = true;
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

  updateSchooladmin() {
    const data = {
      username: this.user_username,
      first_name: this.user_first_name,
      last_name: this.user_last_name,
      gender: this.user_gender,
      email: this.user_email,
      role: 'schooladmin',
      phone: this.user_phone,
      address: this.user_address,
      details: {
        school_uuid: this.school_uuid,
      },
    };

    console.log('ditel', this.school_uuid);

    console.log('wir', data);

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

        this.getAllSchooladmin();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });

    this.isModalEditOpen = false;
    this.cdRef.detectChanges();
  }

  openDetailModal(user_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/superadmin/user/as/${user_uuid}`, {
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
        this.user_role = 'schooladmin';
        this.user_phone = detailData.user_details.user_phone;
        this.user_address = detailData.user_details.user_address;
        this.school_name = detailData.user_details.school_name;
        // this.user_picture = detailData.user_details.user_picture;

        this.initialAvatar =
          this.user_first_name.charAt(0).toUpperCase() +
          this.user_last_name.charAt(0).toUpperCase();

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

  onDeleteSchoolAdmin(id: string) {
    this.isModalDeleteOpen = true;
    this.cdRef.detectChanges();

    this.user_uuid = id;
  }

  closeDeleteModal() {
    this.isModalDeleteOpen = false;
    this.cdRef.detectChanges();
  }

  performDeleteSchoolAdmin(id: string) {
    axios
      .delete(`${this.apiUrl}/api/superadmin/user/as/delete/${id}`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

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
}
