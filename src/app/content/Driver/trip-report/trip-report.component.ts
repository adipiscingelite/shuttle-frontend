import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trip-report.component.html',
  styleUrl: './trip-report.component.css',
})
export class TripReportComponent {
  imageUrl: string | ArrayBuffer | null = null;
  isDropdownOpen: boolean = false;
  actionType: string = 'Category of Issue'; // Default value
  showOtherIssuesInput: boolean = false; // Kontrol untuk input teks
  otherIssueText: string = ''; // Menyimpan teks input "Other Issues"
  dropdownOptions: string[] = ['Mechanical Issue', 'Accident', 'Health Emergency', 'Other Issues'];


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target?.result ?? null;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  handleAction(actionType: string): void {
    console.log(`Action selected: ${actionType}`);
    this.actionType = actionType;
    this.isDropdownOpen = false; // Tutup dropdown setelah aksi dipilih
    this.showOtherIssuesInput = actionType === 'otherIssues'; // Tampilkan input jika "Other Issues" dipilih
  }
}
