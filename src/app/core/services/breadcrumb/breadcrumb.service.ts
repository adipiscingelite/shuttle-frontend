import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ProfileService } from '../profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private breadcrumbsSubject = new BehaviorSubject<
    Array<{ label: string; url: string }>
  >([]);
  breadcrumbs$ = this.breadcrumbsSubject.asObservable();
  role_code: string = '';
  private roleSubject = new BehaviorSubject<string>('');
  roleBaseURLs: { [role: string]: string } = {
    SA: '/superadmin',
    AS: '/admin',
    P: '/parent',
    D: '/driver',
  };

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cookieService: CookieService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const baseURL = this.getBaseURLForCurrentRole();
        const breadcrumbs = this.createBreadcrumbs(
          this.activatedRoute.root,
          baseURL,
        );
        this.breadcrumbsSubject.next(breadcrumbs); // Emit breadcrumbs terbaru
      });
  }

  // Mendapatkan base URL berdasarkan role_code
  public getBaseURLForCurrentRole(): string {
    const role_code = this.roleSubject.value;
    return this.roleBaseURLs[role_code] || '/';
  }

  // Fungsi untuk mengupdate role_code setelah API call
  public setRoleCode(role_code: string): void {
    this.roleSubject.next(role_code);
  }

  // Verifikasi token dan mendapatkan role_code dari API
  public async verifyTokenAndSetRole(): Promise<void> {
    try {
      // Ambil token dari cookie
      const token = this.cookieService.get('accessToken');
      if (!token) {
        throw new Error('Token tidak ditemukan!');
      }

      // Subscribe ke ProfileService untuk mendapatkan data profil
      this.profileService.profileData$.subscribe(
        (data) => {
          if (data) {
            // Set data profil ke properti kelas
            // this.user_id = data.user_id;
            // this.first_name = data.first_name;
            // this.last_name = data.last_name;
            // this.email = data.email;
            // this.password = data.password;
            // this.status = data.status;
            this.role_code = data.role_code;
            // this.role = data.role;
            // this.picture = data.picture;

            // // Inisialisasi avatar
            // this.initialAvatar =
            //   this.first_name.charAt(0).toUpperCase() +
            //   this.last_name.charAt(0).toUpperCase();

            // console.log('Profile fetched:', this.email);

            // Set role_code untuk navigasi
            this.setRoleCode(this.role_code);
          } else {
            console.warn('Data profil tidak ditemukan!');
            this.router.navigate(['/login']);
          }
        },
        (error) => {
          console.error('Error saat mengambil data profil:', error);
          this.router.navigate(['/login']);
        },
      );
    } catch (error) {
      console.error('Error umum saat verifikasi token:', error);
      this.router.navigate(['/login']);
    }
  }

  // Membuat breadcrumbs
  private createBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Array<{ label: string; url: string }> = [],
  ): Array<{ label: string; url: string }> {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url
        .map((segment) => segment.path)
        .join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      breadcrumbs.push({ label: child.snapshot.data['breadcrumb'], url: url });
      return this.createBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }
}
