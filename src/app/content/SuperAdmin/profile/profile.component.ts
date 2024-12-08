import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ProfileService } from '../../../Services/profile/profile.service';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule,],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class SuperadminProfileComponent {
  private apiUrl: string;
  openTab = 1;

  user_id: string = '';
  username: string = 'belum ada username';
  first_name: string = '';
  last_name: string = '';
  email: string = '';
  password: string = '';
  status: string = '';
  role_code: string = '';
  role: string = '';
  picture: string = '';

  initialAvatar: string = '';

  constructor(
    private profileService: ProfileService,
    @Inject('apiUrl') apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
  }

  toggleTabs($tabNumber: number) {
    this.openTab = $tabNumber;
  }

  async ngOnInit(): Promise<void> {
    await this.fetchProfileData();
  }

  async fetchProfileData(): Promise<void> {
    try {
      this.profileService.profileData$.subscribe((data) => {
        if (data) {
          this.user_id = data.user_id;
          // this.username = data.username;
          this.first_name = data.first_name;
          this.last_name = data.last_name;
          this.email = data.email;
          this.password = data.password;
          this.status = data.status;
          this.role_code = data.role_code;
          this.role = data.role;
          this.picture = data.picture;

          this.initialAvatar =
            this.first_name.charAt(0).toUpperCase() +
            this.last_name.charAt(0).toUpperCase();
        }
        
        console.log('profile fetch profile', this.email);
      });
    } catch (error) {
      console.error('Error fetching profile data in sidebar', error);
    }
  }
}
