// ANGULAR
import { CommonModule, DatePipe } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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

interface Routes {
  route_name_uuid: string;
  route_name: string;
  route_description: string;
  // created_at: string;
  route_assignment: RouteAssignment[];
}

interface RouteAssignment {
  driver_uuid: string;
  driver_first_name: string;
  driver_last_name: string;
  students: Student[];
}

interface Student {
  student_uuid: string;
  student_first_name: string;
  student_last_name: string;
  student_status: string;
  student_order: number;
}

interface Route {
  route_uuid: string;
  // driver: driverDetail;
  // student: studentDetail;
  user_uuid: string;
  user_username: string;
  student_uuid: string;
  student_name: string;
  school: schoolDetail;
  route_name: string;
  route_description: string;
}

interface driverDetail {
  user_uuid: string;
  user_username: string;
}

interface studentDetail {
  student_uuid: string;
  student_first_name: string;
  student_last_name: string;
}

interface schoolDetail {
  school_id: string;
  school_name: string;
}

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [
    AgGridAngular,
    CommonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular,
    AsteriskComponent,
    RequiredCommonComponent,
    SpinnerComponent,
  ],
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.css',
  animations: [toastInOutAnimation, modalScaleAnimation],
})
export class RoutesComponent implements OnInit, AfterViewInit {
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

  // For data routes
  route_uuid: string = '';
  route_name_uuid: string = '';
  driver_uuid: string = '';
  driver_first_name: string = '';
  driver_last_name: string = '';
  user_uuid: string = '';
  user_username: string = '';
  driver_name: string = '';
  student_name: string = '';
  student_uuid: string = '';
  student_first_name: string = '';
  school_uuid: string = '';
  route_name: string = '';
  route_description: string = '';

  // For initial avatar
  initialAvatar: string = '';

  // For loading
  isLoading: boolean = false;

  // For CRUD Modal
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;
  isModalDeleteOpen: boolean = false;

  // Row list data routes
  rowListAllRoute: Routes[] = [];

  // Row list data driver
  rowListAllDriver: driverDetail[] = [];

  // Row list data student
  rowListAllStudent: studentDetail[] = [];
  rowListAllFreeStudent: studentDetail[] = [];

  // Row list data school
  rowListAllSchool: schoolDetail[] = [];
  students: Student[] = [];

  constructor(
    private cookieService: CookieService,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    public toastService: ToastService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');

    this.infoHAForm = this.fb.group({
      students: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.getAllRoute();
    this.getAllDriver();
    this.getAllStudent();
    this.getAllFreeStudent();
  }

  ngAfterViewInit(): void {
    this.cdRef.detectChanges();
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
  colHeaderListRoutes: ColDef<Routes>[] = [
    {
      headerName: 'No.',
      valueGetter: 'node.rowIndex + 1',
      width: 50,
      pinned: 'left',
      sortable: false,
    },
    {
      headerName: 'Route Name',
      field: 'route_name',
      maxWidth: 250,
      sortable: true,
    },
    // {
    //   headerName: 'Driver Name',
    //   // field: 'driver.user_username',
    //   field: 'user_username',
    //   maxWidth: 250,
    //   sortable: true,
    // },
    // {
    //   headerName: 'Student Name',
    //   // field: 'student.student_first_name',
    //   field: 'student_name',
    //   maxWidth: 250,
    //   sortable: true,
    // },
    // { headerName: 'School',
    //   field: 'school.school_name',
    //   maxWidth: 250,
    //   sortable: true,
    // },
    {
      headerName: 'Route Description',
      field: 'route_description',
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
          this.openEditModal(params.data.route_name_uuid);
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
          this.openDetailModal(params.data.route_name_uuid);
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
          this.onDeleteRoute(params.data.route_name_uuid);
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

  // input dinamis coy
  infoHAForm: FormGroup;

  getInfoHAField(): FormGroup {
    return this.fb.group({
      student_uuid: ['', Validators.required], // Nilai default kosong dengan validasi
    });
    this.cdRef.detectChanges();
  }

  // Fungsi untuk menambahkan student baru
  // To add a new student to the FormArray
  addInfoHAField() {
    const studentControl = this.fb.group({
      student_uuid: ['', Validators.required],
    });
    this.infoHAListArray.push(studentControl);

    this.cdRef.detectChanges();
  }

  // To remove a student from the FormArray
  removeInfoHAField(i: number) {
    this.infoHAListArray.removeAt(i);
  }

  // Mendapatkan FormArray untuk binding di template
  get infoHAListArray(): FormArray {
    return this.infoHAForm.get('students') as FormArray;
  }

  // Submit form
  data(): void {
    console.log(this.infoHAForm.value);
  }

  isAddButtonEnabled(): boolean {
    // Memeriksa apakah semua form group dalam infoHAListArray valid
    return this.infoHAListArray.controls.every((group) => group.valid);
  }

  // Get all routes
  getAllRoute() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/school/route/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllRoute = response.data.data.data;
        console.log('route', response);
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

  // Get all driver
  getAllDriver() {
    axios
      .get(`${this.apiUrl}/api/school/user/driver/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllDriver = response.data.data.data;
        console.log('driver', this.rowListAllDriver);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  // Get all student
  getAllStudent() {
    axios
      .get(`${this.apiUrl}/api/school/student/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllStudent = response.data.data.data;
        console.log('student', this.rowListAllStudent);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }
  // Get all student
  getAllFreeStudent() {
    axios
      .get(`${this.apiUrl}/api/school/student/free/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllFreeStudent = response.data.students;
        console.log('free student', this.rowListAllFreeStudent);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  openAddModal() {
    this.route_name = '';
    this.route_description = '';
    this.driver_uuid = '';

    this.infoHAForm.reset();
    this.infoHAListArray.clear();

    this.isModalAddOpen = true;
    setTimeout(() => {
      this.addInfoHAField();
    }, 0);
    this.cdRef.detectChanges();
  }

  //Add route
  addRoute() {
    const studentsData = this.infoHAListArray.controls.map(
      (control) => control.value,
    );

    console.log(studentsData);

    const requestData = {
      route_name: this.route_name,
      route_description: this.route_description,
      route_assignment: [
        {
          driver_uuid: this.driver_uuid,
          students: studentsData.map((student, index) => ({
            student_uuid: student.student_uuid,
            student_order: (index + 1).toString(),
          })),
        },
      ],
    };

    console.log('request', requestData);
    axios
      .post(`${this.apiUrl}/api/school/route/add`, requestData, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.getAllRoute();
        this.getAllFreeStudent();
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
    this.cdRef.detectChanges();
  }
  openEditModal(route_name_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/school/route/${route_name_uuid}`, {
        headers: { Authorization: `${this.cookieService.get('accessToken')}` },
      })
      .then((response) => {
        const editData = response.data;
        console.log(editData);

        const editDataRouteAssignment = response.data.route_assignment[0];
        // Mengisi data ke form
        this.route_name_uuid = editData.route_name_uuid;
        this.route_name = editData.route_name;
        this.route_description = editData.route_description;
        this.driver_uuid = editDataRouteAssignment.driver_uuid;

        // Mengisi array students
        this.students = editDataRouteAssignment.students.map(
          (student: Student) => ({
            student_uuid: student.student_uuid,
            student_first_name: student.student_first_name,
            student_last_name: student.student_last_name,
            student_status: student.student_status,
            student_order: +student.student_order, // Pastikan order berupa angka
          }),
        );

        // Urutkan data berdasarkan student_order
        this.students = this.students.sort(
          (a, b) => a.student_order - b.student_order,
        );

        this.infoHAForm.reset();
        this.infoHAListArray.clear();

        this.isModalEditOpen = true;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching route data:', error);
      });
  }

  onDrop(event: CdkDragDrop<Student[]>) {
    const previousIndex = event.previousIndex;
    const currentIndex = event.currentIndex;

    // Pindahkan item dalam array
    moveItemInArray(this.students, previousIndex, currentIndex);

    // Setelah pemindahan, urutkan ulang berdasarkan student_order
    this.students = this.students.sort(
      (a, b) => a.student_order - b.student_order,
    );

    // Jika perlu, perbarui data lainnya
    this.students = this.students.map((student, index) => ({
      ...student,
      student_order: index + 1, // Update student order sesuai index
    }));
  }

  // Add new student
  addStudent() {
    this.students.push({
      student_uuid: '',
      student_first_name: 'New',
      student_last_name: 'Student',
      student_status: 'present',
      student_order: this.students.length + 1,
    });
  }

  // Remove student
  removeStudent(index: number) {
    console.log('Before removing:', this.students);
    this.students.splice(index, 1);
    console.log('After removing:', this.students);

    // Update order
    this.students.forEach((student, idx) => {
      student.student_order = idx + 1;
    });

    this.cdRef.detectChanges();
  }

  updateRoute() {
    // Gabungkan data siswa lama dan siswa baru
    const allStudents = [...this.students, ...this.infoHAForm.value.students];

    // Filter siswa duplikat (opsional, jika `student_uuid` wajib unik)
    const uniqueStudents = allStudents.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.student_uuid === value.student_uuid),
    );

    // Pastikan urutan benar
    uniqueStudents.forEach((student, index) => {
      student.student_order = index + 1; // Urutkan ulang berdasarkan posisi
    });

    const requestData = {
      driver_uuid: this.driver_uuid,
      route_name: this.route_name,
      route_description: this.route_description,
      students: uniqueStudents.map((student) => ({
        student_uuid: student.student_uuid,
        // student_first_name: student.student_first_name,
        student_order: student.student_order, // Pastikan ini sesuai
      })),
    };

    console.log('request', requestData);

    axios
      .put(
        `${this.apiUrl}/api/school/route/update/${this.route_name_uuid}`,
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

        this.getAllRoute();
        this.getAllFreeStudent();
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

  openDetailModal(route_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/school/route/${route_uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        console.log('detailData', response);
        const detailData: RouteAssignment = response.data;

        // Assign values to component variables
        // this.route_name_uuid = detailData.route_name_uuid;
        this.driver_first_name = detailData.driver_first_name;
        this.driver_last_name = detailData.driver_last_name;
        this.driver_uuid = detailData.driver_uuid;
        // this.route_name = detailData.route_name;
        // this.route_description = detailData.route_description;
        this.students = detailData.students;

        // Buka modal
        this.isModalDetailOpen = true;
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

  closeDetailModal() {
    this.isModalDetailOpen = false;
    this.cdRef.detectChanges();
  }

  // Delete route
  onDeleteRoute(route_uuid: string) {
    this.isModalDeleteOpen = true;
    this.route_uuid = route_uuid;
    this.cdRef.detectChanges();
  }

  performDeleteRoute(route_uuid: string) {
    axios
      .delete(`${this.apiUrl}/api/school/route/delete/${route_uuid}`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        const responseMessage = response.data?.message || 'Success.';
        this.showToast(responseMessage, 3000, Response.Success);

        this.getAllRoute();
        this.isModalDeleteOpen = false;
        this.cdRef.detectChanges();
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

  getFilteredStudents(currentIndex: number): any[] {
    const selectedUUIDs = this.infoHAListArray.controls
      .map(
        (control, index) =>
          index !== currentIndex && control.get('student_uuid')?.value,
      )
      .filter((uuid) => uuid);

    const existingUUIDs = this.students.map((student) => student.student_uuid);

    return this.rowListAllFreeStudent.filter(
      (student) =>
        !selectedUUIDs.includes(student.student_uuid) &&
        !existingUUIDs.includes(student.student_uuid),
    );
  }
}
