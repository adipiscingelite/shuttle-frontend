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
    const accessToken = this.cookieService.check('accessToken');
    const refreshToken = this.cookieService.check('refreshToken');

    if (accessToken || refreshToken) {
      try {
        // Ambil data profil
        const profileData = await this.profileService.fetchProfileData(true);
        const role_code = profileData?.role_code;

        // Arahkan berdasarkan role_code
        if (role_code === 'SA') {
          return this.router.createUrlTree(['/superadmin']);
        } else if (['AS', 'D', 'P'].includes(role_code)) {
          return this.router.createUrlTree(['/admin']);
        } else {
          return this.router.createUrlTree(['/not-found']);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        // Jika ada error saat mengambil profil, arahkan ke login
        return this.router.createUrlTree(['/login']);
      }
    }

    // Jika tidak ada token, izinkan akses ke login
    return true;
  }
}
