import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  step = 1;
  selectedUserType: string | null = null;
  showDetailInfo = false;

  schoolData = {
    schoolName: '',
    schoolAddress: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  };

  driverData = {
    carModel: '',
    licensePlate: '',
    driverName: '',
    driverEmail: '',
    driverPassword: '',
  };

  parentData = {
    childSchool: '',
    childName: '',
    parentName: '',
    parentEmail: '',
    parentPassword: '',
  };

  schools: string[] = ['ABC School', 'XYZ Academy', '123 High School'];

  selectUserType(userType: string) {
    this.selectedUserType = userType;
    this.step = 2;
  }

  submitForm() {
    this.step = 4;
  }

  goBack() {
    this.step = 1;
    this.selectedUserType = null;
  }

  nextStep() {
    if (this.step < 4) {
      this.step++;
    }
  }
}
