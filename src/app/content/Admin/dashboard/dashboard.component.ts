import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HelloAndDateComponent } from '../../../shared/components/hello-and-date/hello-and-date.component';
// import { TooltipDirective } from 'webed-team/ng2-tooltip-directive';
// import {tooltipddir}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HelloAndDateComponent, ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardAdminComponent {

}
