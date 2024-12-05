import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../navigations/header/header.component';
import { SidebarComponent } from '../../navigations/sidebar/sidebar.component';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from '../../Services/profile/profile.service';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './full.component.html',
  styleUrl: './full.component.css',
})
export class FullComponent {
  // private apiUrl: string;
  isSidebarVisible: boolean = false;

  handlerSidebarVisibility(newState: boolean) {
    this.isSidebarVisible = newState;
  }

  handleSidebarClose() {
    this.isSidebarVisible = false;
  }
}
