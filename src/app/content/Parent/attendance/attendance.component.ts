import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { ToastService } from '@core/services/toast/toast.service';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';

interface Recap {
  shuttle_uuid: string;
  student_uuid: string;
  student_first_name: string;
  student_last_name: string;
  student_grade: string;
  student_gender: string;
  school_uuid: string;
  school_name: string;
  status: string;
  date: string;
  created_at: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, AgGridAngular],
  templateUrl: './attendance.component.html',
  styleUrl: './attendance.component.css',
  providers: [DatePipe],
})
export class AttendanceComponent implements OnInit {
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

  rowListRecap: Recap[] = [];

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
    this.getAllChildernRecap();
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

  colHeaderListAllRecap: ColDef<Recap>[] = [
    {
      headerName: 'No.',
      valueGetter: 'node.rowIndex + 1',
      width: 50,
      maxWidth: 70,
      pinned: 'left',
      sortable: false,
    },
    { headerName: 'First Name', field: 'student_first_name', maxWidth: 250 },
    { headerName: 'First Name', field: 'student_last_name', maxWidth: 250 },

    {
      headerName: 'Date',
      field: 'created_at',
      valueGetter: (params) => {
        if (params.data && params.data.created_at) {
          const datePipe = new DatePipe('en-US');

          return datePipe.transform(
            params.data.created_at,
            'dd/MM/yyyy HH:mm:ss',
          );
        }
        return null;
      },
      maxWidth: 250,
    },
    {
      headerName: 'Shuttle Status',
      field: 'status',
      valueGetter: (params) => {
        if (params.data && params.data.status) {
          const statusMap: { [key: string]: string } = {
            home: 'At home',
            waiting_to_be_taken_to_school: 'Waiting for pickup',
            going_to_school: 'On the way',
            at_school: 'At school',
            waiting_to_be_taken_to_home: 'Waiting to go home',
            going_to_home: 'Going home',
          };

          return statusMap[params.data.status] || 'Unknown Status';
        }
        return 'Unknown Status';
      },
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
    if (this.rowListRecap && this.rowListRecap.length > 0) {
      const totalRows = this.rowListRecap.length;
      this.totalRows = totalRows;

      this.startRow = (currentPage - 1) * pageSize + 1;
      this.endRow = Math.min(currentPage * pageSize, this.totalRows);
    } else {
      this.totalRows = 0;
      this.startRow = 0;
      this.endRow = 0;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.paginationTotalPage) {
      this.paginationPage = page;
      this.getAllChildernRecap();
    }
  }

  goToNextPage() {
    if (this.paginationPage < this.paginationTotalPage) {
      this.paginationPage++;
      this.getAllChildernRecap();
    }
  }

  goToPreviousPage() {
    if (this.paginationPage > 1) {
      this.paginationPage--;
      this.getAllChildernRecap();
    }
  }

  changeMaxItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.paginationItemsLimit = +target.value;
    this.paginationPage = 1;
    this.getAllChildernRecap();
  }

  onSortChanged(event: any) {
    if (event && event.columns && event.columns.length > 0) {
      event.columns.forEach((column: any) => {
        const colId = column.colId;
      });

      this.getAllChildernRecap();
    } else {
      console.error('onSortChanged: event.columns is undefined or empty');
    }
  }

  getAllChildernRecap() {
    axios
      .get(`${this.apiUrl}/api/parent/my/childern/recap`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListRecap = response.data;
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }
}
