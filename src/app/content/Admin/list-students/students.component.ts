// ANGULAR
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
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

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

// SHARED
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
}

interface Parent {
  parent_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string; // Bisa gunakan enum untuk nilai role jika ada
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
  // For token
  token: string | null = '';
  // For sorting
  sortBy: string = 'user_id';
  sortDirection: string = 'desc';

  // For pagination
  paginationPage: number = 1;
  paginationCurrentPage: number = 1;
  paginationItemsLimit: number = 10;
  paginationTotalPage: number = 0;
  showing: string = '';
  pages: number[] = [];

  // For data student
  student_uuid: string = '';
  student_first_name: string = '';
  student_last_name: string = '';
  student_gender: string = '';
  student_grade: string = '';
  student_address: string = '';
  student_pickup_point: string = '';
  student_pickup_latitude: number | null = null;
  student_pickup_longitude: number | null = null;

  // For data parent
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

  // For initial avatar
  initialAvatar: string = '';

  // For loading
  isLoading: boolean = false;

  // For CRUD Modal
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;
  isModalDeleteOpen: boolean = false;

  //Row list data parrent and school
  rowListAllSchool: schoolDetail[] = [];

  // Row data to be displayed in the table
  rowListAllStudent: Student[] = [];

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
      headerName: 'Pickup Point',
      field: 'student_pickup_point',
      maxWidth: 250,
      sortable: true,
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
      pinned: 'right',
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

  goToPage(page: number) {
    if (page >= 1 && page <= this.paginationTotalPage) {
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

  // For fetching data
  getAllStudent() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/school/student/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
        // params: {
        //   // page: this.paginationPage,
        //   // limit: this.paginationItemsLimit,

        //   // sort_by: this.sortBy,
        //   // direction: this.sortDirection,
        // },
      })
      .then((response) => {
        console.log('response', response.data.data.data);
        this.rowListAllStudent = response.data.data.data;
        this.paginationTotalPage = response.data.data.meta.total_page;
        this.pages = Array.from(
          { length: this.paginationTotalPage },
          (_, i) => i + 1,
        ); // Copy data
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
    this.isModalAddOpen = true;
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
        console.log('edit', response);

        const editData = response.data.data;

        // Set data ke dalam variabel komponen yang terikat dengan form
        this.student_uuid = editData.student_uuid;
        this.student_first_name = editData.student_first_name;
        this.student_last_name = editData.student_last_name;
        this.student_gender = editData.student_gender.toLowerCase();
        this.student_grade = editData.student_grade;
        this.student_address = editData.student_address;

        const studentPickUpPoint = JSON.parse(editData.student_pickup_point);
        this.student_pickup_latitude = studentPickUpPoint.latitude;
        this.student_pickup_longitude = studentPickUpPoint.longitude;

        this.parent_name = editData.parent_name;
        this.parent_username = editData.parent_username;
        this.parent_first_name = editData.first_name;
        this.parent_last_name = editData.last_name;
        this.parent_gender = editData.gender;
        this.parent_email = editData.email;
        this.parent_phone = editData.parent_phone;
        this.parent_address = editData.address;

        // Buka modal
        this.isModalEditOpen = true;
        this.cdRef.detectChanges(); // Pastikan perubahan terdeteksi di view
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
      // student: {
        student_first_name: this.student_first_name,
        student_last_name: this.student_last_name,
        student_gender: this.student_gender,
        student_grade: this.student_grade,
        student_address: this.student_address,
        student_pickup_point: {
          latitude: this.student_pickup_latitude,
          longitude: this.student_pickup_longitude,
        },
      // },
      // parent: {
      //   username: this.parent_username,
      //   first_name: this.parent_first_name,
      //   last_name: this.parent_last_name,
      //   gender: this.parent_gender,
      //   role: 'parent',
      //   email: this.parent_email,
      //   password: this.parent_password,
      //   phone: this.parent_phone,
      //   address: this.parent_address,
      // },
    };

    console.log('update', requestData);

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

        // Set data ke dalam variabel komponen yang terikat dengan form
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
}
