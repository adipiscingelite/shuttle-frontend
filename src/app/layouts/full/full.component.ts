import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from '../../core/services/profile/profile.service';
import { FooterComponent } from '@layouts/footer/footer.component';

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent],
  templateUrl: './full.component.html',
  styleUrl: './full.component.css',
})
export class FullComponent {
  isSidebarVisible: boolean = false;

  handlerSidebarVisibility(newState: boolean) {
    this.isSidebarVisible = newState;
  }

  handleSidebarClose() {
    this.isSidebarVisible = false;
  }
}
