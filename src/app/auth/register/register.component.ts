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
  step = 1; // Langkah saat ini (1: Choose User, 2: Fill Form, 3: Success)
  selectedUserType: string | null = null; // Menyimpan tipe user yang dipilih
  showDetailInfo = false;

  schoolData = {
    schoolName: '',
    schoolAddress: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  };

  // Data untuk Driver
  driverData = {
    carModel: '',
    licensePlate: '',
    driverName: '',
    driverEmail: '',
    driverPassword: '',
  };

  // Data untuk Parent
  parentData = {
    childSchool: '',
    childName: '',
    parentName: '',
    parentEmail: '',
    parentPassword: '',
  };

  // Contoh dropdown sekolah
  schools: string[] = ['ABC School', 'XYZ Academy', '123 High School'];


  // Fungsi untuk memilih tipe user
  selectUserType(userType: string) {
    this.selectedUserType = userType;
    this.step = 2; // Pindah ke langkah 2 setelah memilih tipe user
  }

  // Fungsi untuk melanjutkan ke langkah 3 (Success)
  submitForm() {
    this.step = 4;
  }

  // Fungsi untuk kembali ke langkah 1
  goBack() {
    this.step = 1;
    this.selectedUserType = null; // Reset tipe user
  }

  nextStep() {
    if (this.step < 4) {
      this.step++;
    }
  }
}
