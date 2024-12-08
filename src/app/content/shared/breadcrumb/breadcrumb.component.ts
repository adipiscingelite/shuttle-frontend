import { Component } from '@angular/core';
import { BreadcrumbService } from '../../../Services/breadcrumb/breadcrumb.service';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css',
})
export class BreadcrumbComponent {
  breadcrumbs: any;
  baseURL: string = '';

  constructor(private breadcrumbService: BreadcrumbService) {}
  ngOnInit(): void {
    this.breadcrumbService.verifyTokenAndSetRole().then(() => {
      // Setelah role_code diambil, set baseURL dan breadcrumbs
      this.baseURL = this.breadcrumbService.getBaseURLForCurrentRole();
      this.breadcrumbs = this.breadcrumbService.breadcrumbs$;
    });

    console.log('bread', this.breadcrumbs);
    
  }
}
