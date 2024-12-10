import { Inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { ProfileService } from '../Services/profile/profile.service';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class loginGuard implements CanActivate {
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
        // Kirim request ke /api/my/profile menggunakan Axios
        const response = await axios.get<any>(`${this.apiUrl}/api/my/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Jika response berhasil, ambil data profil
        const profileData = response.data;
        const role_code = profileData?.role_code;

        // Arahkan berdasarkan role_code
        if (role_code === 'SA') {
          return this.router.createUrlTree(['/superadmin']);
        } else if (['AS', 'D', 'P'].includes(role_code)) {
          return this.router.createUrlTree(['/admin']);
        } else {
          return this.router.createUrlTree(['/not-found']);
        }
      } catch (error: any) {
        console.error('Error fetching profile data:', error);

        // Jika respons adalah 401, hapus semua cookies dan arahkan ke /login
        if (error.response && error.response.status === 401) {
          this.cookieService.deleteAll(); // Hapus semua cookies
          return this.router.createUrlTree(['/login']);
        }

        // Jika error lainnya, arahkan ke login
        return this.router.createUrlTree(['/login']);
      }
    }

    // Jika tidak ada token, izinkan akses ke login
    return true;
  }
}
