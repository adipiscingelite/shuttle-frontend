import { Inject, Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
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
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    try {
      const token = this.cookieService.get('accessToken');
      if (!token) {
        this.handleAuthError();
        return false;
      }

      const profileData = await this.profileService.fetchProfileData(true); // Selalu reload data
      const roleCode = profileData?.user_role_code;

      if (!roleCode) {
        this.handleAuthError();
        return false;
      }

      const url = state.url;
      if (!this.checkRoleAccess(url, roleCode)) {
        this.router.navigate(['/not-found']);
        return false;
      }

      return true;
    } catch (error) {
      this.handleAuthError();
      return false;
    }
  }

  private checkRoleAccess(url: string, roleCode: string): boolean {
    const roleRoutes = {
      '/superadmin': ['SA'],
      '/admin': ['AS'],
      '/driver': ['D'],
      '/parent': ['P'],
    };

    for (const [route, roles] of Object.entries(roleRoutes)) {
      if (url.startsWith(route) && !roles.includes(roleCode)) {
        return false;
      }
    }
    return true;
  }

  private handleAuthError(): void {
    this.profileService.resetProfileData();
    this.router.navigate(['/login']);
  }
}
