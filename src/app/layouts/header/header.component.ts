import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../core/services/profile/profile.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  isProfileDropdownOpen: boolean = true;
  isSidebarVisible: boolean = false;

  @Output() sidebarVisibilityChange = new EventEmitter<boolean>();

  constructor(private profileService: ProfileService) {}

  first_name: string = '';
  last_name: string = '';
  picture: string = '';
  initialAvatar: string = '';

  async ngOnInit(): Promise<void> {
    this.profileService.profileData$.subscribe((data) => {
      if (data) {
        this.first_name = data.user_details.user_first_name;
        this.last_name = data.user_details.user_last_name;
        this.picture = data.picture;

        this.initialAvatar =
          this.first_name.charAt(0).toUpperCase() +
          this.last_name.charAt(0).toUpperCase();
      }
    });
  }

  openSidebar() {
    this.isSidebarVisible = true;
    this.sidebarVisibilityChange.emit(this.isSidebarVisible);
  }
}
