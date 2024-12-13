import { Inject, Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { ProfileService } from '../services/profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
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
  ): Promise<boolean> {
    const token = this.cookieService.get('accessToken');
    console.log('Token mentah:', token);

    if (token) {
      try {
        const profileData = await this.profileService.fetchProfileData();

        const roleCode = profileData.user_role_code;

        console.log('Role code:', roleCode);

        if (!roleCode) {
          this.router.navigate(['/login']);
          return false;
        }

        const url = state.url;

        if (url.startsWith('/superadmin') && roleCode !== 'SA') {
          this.router.navigate(['/not-found']);
          return false;
        } else if (url.startsWith('/admin') && roleCode !== 'AS') {
          this.router.navigate(['/not-found']);
          return false;
        } else if (url.startsWith('/driver') && roleCode !== 'D') {
          this.router.navigate(['/not-found']);
          return false;
        } else if (url.startsWith('/parent') && roleCode !== 'P') {
          this.router.navigate(['/not-found']);
          return false;
        }
        return true;
      } catch (error) {
        this.router.navigate(['/not-found']);
        return false;
      }
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
