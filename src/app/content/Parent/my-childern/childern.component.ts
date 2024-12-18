import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsteriskComponent } from '@shared/components/asterisk/asterisk.component';
import { RequiredCommonComponent } from '@shared/components/required-common/required-common.component';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
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
  selector: 'app-childern',
  standalone: true,
  imports: [
    CommonModule,
    RequiredCommonComponent,
    AsteriskComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './childern.component.html',
  styleUrl: './childern.component.css',
})
export class ChildernComponent implements OnInit {
  token: string | null = '';

  student_uuid: string = '';
  first_name: string = '';
  last_name: string = '';
  grade: string = '';
  gender: string = '';
  school_uuid: string = '';
  school_name: string = '';

  initialAvatar: string = '';

  isModalEditOpen: boolean = false;

  rowListChildern: Childern[] = [];

  constructor(
    private cookieService: CookieService,
    private cdRef: ChangeDetectorRef,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
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
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  openEditModal(childern_uuid: string) {
    axios
      .get(`${this.apiUrl}/api/parent/my/childern/${childern_uuid}`, {
        headers: {
          Authorization: `${this.token}`,
        },
      })
      .then((response) => {
        console.log('Full Response:', response);
        const editData = response.data;

        console.log('pppp', editData);

        this.student_uuid = editData.student_uuid;
        this.first_name = editData.first_name;
        this.last_name = editData.last_name;
        this.grade = editData.grade;
        this.gender = editData.gender;
        this.school_uuid = editData.school_uuid;
        this.school_name = editData.school_name;

        this.initialAvatar =
          this.first_name.charAt(0).toUpperCase() +
          this.last_name.charAt(0).toUpperCase();
        console.log('Assigned Values:', {
          first_name: this.first_name,
          last_name: this.last_name,
          initialAvatar: this.initialAvatar,
        });

        this.isModalEditOpen = true;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        // const responseMessage =
        //   error.response?.data?.message || 'An unexpected error occurred.';
        // this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  closeEditModal() {
    this.isModalEditOpen = false;
    // this.cdRef.detectChanges();
  }
}
