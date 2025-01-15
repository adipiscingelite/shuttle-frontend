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
  ) {}

  async fetchProfileData(reload: boolean = false): Promise<any> {
    try {
      if (!reload && this.profileData.getValue() !== null) {
        return this.profileData.getValue();
      }

      const token = this.cookieService.get('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await axios.get<any>(`${this.apiUrl}/api/my/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data?.data) {
        this.profileData.next(response.data.data);
        return response.data.data;
      } else {
        throw new Error('Invalid profile data format');
      }
    } catch (error) {
      this.resetProfileData(); // Reset data jika terjadi error
      throw error;
    }
  }

  resetProfileData(): void {
    this.profileData.next(null);
    this.cookieService.delete('accessToken', '/');
    this.cookieService.delete('refreshToken', '/');
    this.cookieService.deleteAll()
  }
}