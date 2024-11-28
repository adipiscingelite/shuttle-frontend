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

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private apiUrl: string;

  constructor(private router: Router, private cookieService: CookieService) {
    this.apiUrl = environment.apiUrl;
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    const token = this.cookieService.get('accessToken');
    console.log('Token mentah:', token);

    if (token) {
      try {
        // Verifikasi token dengan melakukan request ke endpoint validasi
        const response = await axios.get(`${this.apiUrl}/api/my/profile`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        const roleCode = response.data.role_code; // Pastikan role_code ada di respons API
        console.log('Role code:', roleCode);

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

        // Jika request berhasil, berarti token valid
        console.log('Token valid:', response.data);
        return true;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          // Token tidak valid, hapus semua cookies dan arahkan ke halaman login
          this.cookieService.deleteAll();
          Swal.fire({
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
            icon: 'warning',
            timer: 1000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
          }).then(() => {
            localStorage.setItem('redirectUrl', state.url); // Simpan URL yang diminta sebelum login
            this.router.navigate(['/login']);
          });
        } else {
          // Tangani error lainnya
          console.error('Error during token validation:', error);
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
      // Tidak ada token, simpan URL dan arahkan ke halaman login
      localStorage.setItem('redirectUrl', state.url); // Simpan URL yang diminta sebelum login
      this.router.navigate(['/login']);
      return false;
    }
    // return true
  }
  // async canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ): Promise<boolean> {
  //   const token = this.cookieService.get('userToken');
  //   const role_code: string = 'A';

  //   if (token) {
  //     const url = state.url;
  //     if (url.startsWith('/admin') && role_code !== 'A') {
  //       this.router.navigate(['/not-found']);
  //       return false;
  //     } else if (url.startsWith('/superadmin') && role_code !== 'SA') {
  //       this.router.navigate(['/not-found']);
  //       return false;
  //     }
  //     return true;
  //   } else {
  //     this.router.navigate(['/login']);
  //     return false;
  //   }
  // }
}
