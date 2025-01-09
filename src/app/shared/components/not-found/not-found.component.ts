import { Component, Inject, OnInit } from '@angular/core';
import { ProfileService } from '@core/services';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.css',
})
export class NotFoundComponent implements OnInit {
  private apiUrl: string;
  role_code: string = '';

  constructor(
    private profileService: ProfileService,
    @Inject('apiUrl') apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
  }

  ngOnInit(): void {
    this.fetchProfileData();
  }

  async fetchProfileData(): Promise<void> {
    try {
      this.profileService.profileData$.subscribe((data) => {
        this.role_code = data.user_role_code;
        console.log(this.role_code);
        
      });
    } catch (error) {
      console.error('Error fetching profile data in sidebar', error);
    }
  }
}
