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
        this.breadcrumbsSubject.next(breadcrumbs);
      });
  }

  public getBaseURLForCurrentRole(): string {
    const role_code = this.roleSubject.value;
    return this.roleBaseURLs[role_code] || '/';
  }

  public setRoleCode(role_code: string): void {
    this.roleSubject.next(role_code);
  }

  public async verifyTokenAndSetRole(): Promise<void> {
    try {
      const token = this.cookieService.get('accessToken');
      if (!token) {
        throw new Error('Token tidak ditemukan!');
      }

      this.profileService.profileData$.subscribe(
        (data) => {
          if (data) {
            this.role_code = data.role_code;

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
