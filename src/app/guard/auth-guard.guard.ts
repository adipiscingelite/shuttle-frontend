import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import { ProfileService } from '../Services/profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private apiUrl: string;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private cookieService: CookieService,
  ) {
    this.apiUrl = environment.apiUrl;
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<boolean> {
    const token = this.cookieService.get('accessToken');
    console.log('Token mentah:', token);

    if (token) {
      try {
        // Pastikan data profil sudah diambil dari service
        const profileData = await this.profileService.fetchProfileData(); // Tunggu hingga data selesai diambil

        // Dapatkan role_code dari data yang sudah diambil
        const roleCode = profileData.role_code;

        console.log('Role code:', roleCode);

        if (!roleCode) {
          // Jika tidak ada roleCode, arahkan ke login karena data profil belum ada
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

        // Jika semuanya oke, izinkan navigasi
        return true;
      } catch (error) {
        console.error('Error during token validation:', error);
        if (error instanceof Error) {
          Swal.fire({
            title: 'Error',
            text: 'An unexpected error occurred. Please try again later.',
            icon: 'error',
            timer: 1000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          });
        }
        return false;
      }
    } else {
      // Tidak ada token, arahkan ke halaman login
      localStorage.setItem('redirectUrl', state.url); // Simpan URL yang diminta sebelum login
      this.router.navigate(['/login']);
      return false;
    }
  }
}
