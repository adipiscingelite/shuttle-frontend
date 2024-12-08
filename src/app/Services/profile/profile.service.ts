import { Inject, Injectable } from '@angular/core';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private profileData = new BehaviorSubject<any>(null);
  profileData$ = this.profileData.asObservable();

  constructor(
    @Inject('apiUrl') private apiUrl: string,
    private cookieService: CookieService,
  ) {
    this.apiUrl = apiUrl;
  }

  async fetchProfileData(roload: boolean = false): Promise<any> {
    console.log('Memeriksa data profil...');

    if (!roload && this.profileData.getValue() !== null) {
      console.log(
        'Data sudah ada di BehaviorSubject, tidak perlu request lagi.',
      );

      return this.profileData.getValue();
    }
    console.log('Data belum ada, melakukan request ke API...');

    const token = this.cookieService.get('accessToken');
    try {
      const response = await axios.get<any>(`${this.apiUrl}/api/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.profileData.next(response.data); // Update dengan data baru
      return response.data;
    } catch (error) {
      console.error('Error fetching profile data with Axios:', error);
      throw error;
    }
  }

  resetProfileData(): void {
    this.profileData.next(null); // Reset data ke null
    console.log('BehaviorSubject di-reset!');
  }
}
