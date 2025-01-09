import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { ProfileService } from '../../../core/services/profile/profile.service';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileAdminComponent {
  private apiUrl: string;
  openTab = 1;

  user_uuid: string = '';
  user_username: string = '';
  user_first_name: string = '';
  user_last_name: string = '';
  user_gender: string = '';
  user_email: string = '';
  user_password: string = '';
  user_role: string = '';
  user_role_code: string = '';
  user_phone: string = '';
  user_address: string = '';
  user_status: string = '';
  user_picture: string = '';

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
        console.log('data profil dari subs service', data);

        if (data) {
          this.user_uuid = data.user_user_id;
          this.user_username = data.user_username;
          this.user_first_name = data.user_details.user_first_name;
          this.user_last_name = data.user_details.user_last_name;
          this.user_gender = data.user_details.user_gender;
          this.user_email = data.user_email;
          this.user_password = data.user_password;
          this.user_status = data.user_status;
          this.user_role_code = data.user_role_code;
          this.user_role = data.user_role;
          this.user_picture = data.user_picture;

          this.initialAvatar =
            this.user_first_name.charAt(0).toUpperCase() +
            this.user_last_name.charAt(0).toUpperCase();
        }
      });
    } catch (error) {
      console.error('Error fetching profile data in sidebar', error);
    }
  }
}
