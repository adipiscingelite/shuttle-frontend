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
  actionType: string = 'Category of Issue';
  showOtherIssuesInput: boolean = false;
  otherIssueText: string = '';
  dropdownOptions: string[] = [
    'Mechanical Issue',
    'Accident',
    'Health Emergency',
    'Other Issues',
  ];

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
    this.actionType = actionType;
    this.isDropdownOpen = false;
    this.showOtherIssuesInput = actionType === 'otherIssues';
  }
}
