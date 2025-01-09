import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '@core/services/toast/toast.service';
import { AsteriskComponent } from '@shared/components/asterisk/asterisk.component';
import { RequiredCommonComponent } from '@shared/components/required-common/required-common.component';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { Response } from '@core/interfaces';
import { modalScaleAnimation } from '@shared/utils/modal.animation';
import { toastInOutAnimation } from '@shared/utils/toast.animation';
interface Childern {
  student_uuid: string;
  student_first_name: string;
  student_last_name: string;
  student_grade: string;
  student_gender: string;
  student_address: string;
  student_picup_point: StudentPickupPoint;
  school_uuid: string;
  school_name: string;
  student_status: string;
}

interface StudentPickupPoint {
  latitude: number;
  longitude: number;
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
  animations: [toastInOutAnimation, modalScaleAnimation],
})
export class ChildernComponent implements OnInit {
  token: string | null = '';

  student_uuid: string = '';
  student_first_name: string = '';
  student_last_name: string = '';
  student_grade: string = '';
  student_gender: string = '';
  student_address: string = '';
  student_status: string = '';
  initialStatus: string = '';
  school_uuid: string = '';
  school_name: string = '';

  latitude: number | null = null;
  longitude: number | null = null;

  // for map
  googleMapUrl: string = '';

  initialAvatar: string = '';

  isModalEditOpen: boolean = false;

  rowListChildern: Childern[] = [];
  statusMap: { [key: string]: string } = {};

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
    // Sort children by student_first_name
    this.rowListChildern = response.data.data.sort((a: any, b: any) => {
      const nameA = a.student_first_name.toUpperCase(); // Ignore case
      const nameB = b.student_first_name.toUpperCase(); // Ignore case
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });

    console.log('edit my children', response);

    this.rowListChildern.forEach((child) => {
      this.statusMap[child.student_uuid] = child.student_status; // Store initial status
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
          // Author: token dari firebae,
          // Authos: device token dari firebase
        },
      })
      .then((response) => {
        console.log(response);
        
        const editData = response.data;
        this.student_uuid = editData.student_uuid;
        this.student_first_name = editData.student_first_name;
        this.student_last_name = editData.student_last_name;
        this.student_grade = editData.student_grade;
        this.student_gender = editData.student_gender.toLowerCase();
        this.student_address = editData.student_address;
        this.school_uuid = editData.school_uuid;
        this.school_name = editData.school_name;
        this.student_status = editData.student_status;

        const studentPickupPoint = JSON.parse(editData.student_pickup_point);
        this.latitude = studentPickupPoint.latitude;
        this.longitude = studentPickupPoint.longitude;

        this.isModalEditOpen = true;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  updateChildern() {
    const data = {
      student_uuid: this.student_uuid,
      student_first_name: this.student_first_name,
      student_last_name: this.student_last_name,
      student_grade: this.student_grade,
      student_gender: this.student_gender,
      student_address: this.student_address,
      student_status: this.student_status,
      student_pickup_point: {
        latitude: this.latitude,
        longitude: this.longitude,
      },
      school_uuid: this.school_uuid,
      school_name: this.school_name,
    };

    axios
      .put(
        `${this.apiUrl}/api/parent/my/childern/update/${this.student_uuid}`,
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
        this.getAllMyChildern(); // Update the list of children after the status update
        this.isModalEditOpen = false;
        this.cdRef.detectChanges();
      })
      .catch((error) => {
        const responseMessage =
          error.response?.data?.message || 'An unexpected error occurred.';
        this.showToast(responseMessage, 3000, Response.Error);
      });
  }

  updateChildernStatus(student_uuid: string) {
    // Find the child by UUID
    const child = this.rowListChildern.find(child => child.student_uuid === student_uuid);
    if (!child) return;
  
    // Compare the current status with the initial status
    if (child.student_status !== this.statusMap[student_uuid]) {
      const data = {
        student_status: child.student_status,  // Use the updated status from the dropdown
      };
  
      axios
        .put(
          `${this.apiUrl}/api/parent/my/childern/status/update/${student_uuid}`,
          data,
          {
            headers: {
              Authorization: `${this.token}`,
            },
          }
        )
        .then((response) => {
          const responseMessage = response.data?.message || 'Status updated successfully.';
          this.showToast(responseMessage, 3000, Response.Success);
  
          // Update the local list of children and close the modal
          this.getAllMyChildern();
          this.isModalEditOpen = false;
          this.cdRef.detectChanges();
        })
        .catch((error) => {
          const responseMessage =
            error.response?.data?.message || 'An unexpected error occurred.';
          this.showToast(responseMessage, 3000, Response.Error);
        });
    }
  }
  

  closeEditModal() {
    this.isModalEditOpen = false;
    this.cdRef.detectChanges();
  }

  showToast(message: string, duration: number, type: Response) {
    this.toastService.add(message, duration, type);
  }

  removeToast(index: number) {
    this.toastService.remove(index);
  }

  getCoordinateByUrl(): void {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = this.googleMapUrl.match(regex);

    if (match) {
      this.latitude = parseFloat(match[1]);
      this.longitude = parseFloat(match[2]);
    } else {
      const responseMessage = 'Invalid Google Maps URL';
      this.showToast(responseMessage, 3000, Response.Error);
    }
  }
}
