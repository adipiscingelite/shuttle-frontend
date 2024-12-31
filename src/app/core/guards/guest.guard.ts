import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { ProfileService } from '../services/profile/profile.service';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class GuestGuard implements CanActivate {
  constructor(
    private profileService: ProfileService,
    private router: Router,
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean | UrlTree> {
    const accessToken = this.cookieService.get('accessToken');
    const refreshToken = this.cookieService.get('refreshToken');

    if (accessToken || refreshToken) {
      try {
        const response = await axios.get<any>(`${this.apiUrl}/api/my/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const profileData = response.data.data;
        const role_code = profileData?.user_role_code;

        // Redirect berdasarkan role_code
        if (role_code === 'SA') {
          return this.router.createUrlTree(['/superadmin']);
        } else if (role_code === 'AS') {
          return this.router.createUrlTree(['/admin']);
        } else if (role_code === 'D') {
          return this.router.createUrlTree(['/driver']);
        } else if (role_code === 'P') {
          return this.router.createUrlTree(['/parent']);
        } else {
          return this.router.createUrlTree(['/not-found']);
        }
      } catch (error: any) {
        console.error('Error fetching profile data:', error);

        // Jika respons = 401, hapus isi CookieService
        if (error.response && error.response.status === 401) {
          this.cookieService.deleteAll();
          return this.router.createUrlTree(['/login']); // Gunakan createUrlTree di sini
        }

        return this.router.createUrlTree(['/login']);
      }
    }

    return true;
  }
}
