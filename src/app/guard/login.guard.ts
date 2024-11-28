import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class loginGuard implements CanActivate {
  constructor(private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const token = 'abc'; 

    const role_code: string = 'A'; 

    if (token) {
      if (role_code === 'SA') {
        return this.router.createUrlTree(['/superadmin']);
      } else if (role_code === 'A') {
        return this.router.createUrlTree(['/admin']);
      } else {
        return this.router.createUrlTree(['/unauthorized']);
      }
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}
