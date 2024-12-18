import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

import axios from 'axios';

interface Childern {
  student_uuid: string;
  first_name: string;
  last_name: string;
  grade: string;
  gender: string;
  school_uuid: string;
  school_name: string;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardParentComponent implements OnInit {
  isModalParentForCheckTheChildDetail = false;

  token: string | null = '';

  first_name: string = '';
  last_name: string = '';

  initialAvatar: string = '';
  currentDate: string = '';

  rowListChildern: Childern[] = [];

  constructor(
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
    private datePipe: DatePipe,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
    this.currentDate = this.datePipe.transform(
      new Date(),
      'EEEE, d MMMM yyyy',
      'id-ID',
    )!;
  }

  ngOnInit(): void {
    this.getAllMyChildern();
  }

  getAllMyChildern() {
    axios
      .get(`${this.apiUrl}/api/parent/my/childern/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListChildern = response.data.data;

        this.rowListChildern.forEach((child) => {
          const initialAvatar =
            child.first_name.charAt(0).toUpperCase() +
            child.last_name.charAt(0).toUpperCase();
          // console.log(
          //   `Initial for ${child.first_name} ${child.last_name}: ${initial}`,
          // );
        });

        // this.rowListAllDriver = response.data.data.data;
        // this.paginationTotalPage = response.data.data.meta.total_pages;
        // this.pages = Array.from(
        //   { length: this.paginationTotalPage },
        //   (_, i) => i + 1,
        // );
        // this.showing = response.data.data.meta.showing;

        // console.log('drivers', this.rowListAllDriver);
        // this.isLoading = false;

        // this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }
}
