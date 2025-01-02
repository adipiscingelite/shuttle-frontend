import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import axios from 'axios';
import { CookieService } from 'ngx-cookie-service';
import { ProfileService } from '../../core/services/profile/profile.service';
interface SvgIcons {
  [key: string]: string;
}

interface Item {
  name: string;
  icon: string;
  path: string;
}

interface Section {
  title: string;
  items: Item[];
}
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Add imports
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  private apiUrl: string;
  @Input() isSidebarVisible!: boolean;
  @Output() close = new EventEmitter<void>();

  user_id: string = '';
  email: string = '';
  user_username: string = '';
  first_name: string = '';
  last_name: string = '';
  password: string = '';
  status: string = '';
  role_code: string = '';
  role: string = '';
  picture: string = '';

  initialAvatar: string = '';

  searchText: string = '';
  sections: {
    title: string;
    items: { name: string; icon: string; path: string }[];
  }[] = [];

  isModalDeleteOpen: boolean = false;

  constructor(
    private profileService: ProfileService,
    private sanitizer: DomSanitizer,
    private cookieService: CookieService,
    private router: Router,
    @Inject('apiUrl') apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
  }

  svgIcons: SvgIcons = {
    dashboard: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.5 23.25H2.25a1.5 1.5 0 0 1-1.5-1.5V1.5a.75.75 0 0 1 1.5 0v20.25H22.5a.75.75 0 1 1 0 1.5Z"></path><path d="M7.313 20.25H5.438a1.687 1.687 0 0 1-1.688-1.688v-7.125A1.687 1.687 0 0 1 5.438 9.75h1.875A1.687 1.687 0 0 1 9 11.438v7.124a1.687 1.687 0 0 1-1.688 1.688Z"></path><path d="M14.063 20.25h-1.876a1.687 1.687 0 0 1-1.687-1.688V9.188A1.687 1.687 0 0 1 12.188 7.5h1.874a1.687 1.687 0 0 1 1.688 1.688v9.374a1.687 1.687 0 0 1-1.688 1.688Z"></path><path d="M20.795 20.25H18.92a1.687 1.687 0 0 1-1.688-1.688V6.188A1.687 1.687 0 0 1 18.92 4.5h1.875a1.688 1.688 0 0 1 1.687 1.688v12.375a1.687 1.687 0 0 1-1.687 1.687Z"></path></svg>`,
    studentList: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 6.75H21"></path><path d="M7.5 12H21"></path><path d="M7.5 17.25H21"></path><path d="M3.75 7.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"></path><path d="M3.75 12.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"></path><path d="M3.75 18a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"></path></svg>`,
    routeList: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.75 15.75A3.01 3.01 0 0 0 15.844 18H6.75a3 3 0 0 1 0-6h9a3.75 3.75 0 0 0 0-7.5h-9a.75.75 0 0 0 0 1.5h9a2.25 2.25 0 0 1 0 4.5h-9a4.5 4.5 0 1 0 0 9h9.094a3 3 0 1 0 2.906-3.75Z"></path></svg>`,
    car: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 11.25h21"></path><path d="M20.25 20.25H18a.75.75 0 0 1-.75-.75v-2.25H6.75v2.25a.75.75 0 0 1-.75.75H3.75A.75.75 0 0 1 3 19.5v-8.25l2.803-6.3a.75.75 0 0 1 .684-.45h11.025a.75.75 0 0 1 .685.45L21 11.25v8.25a.75.75 0 0 1-.75.75Z"></path></svg>`,
    schoolList: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">  <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3Zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9ZM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72Z"></path></svg>`,
    adminList: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">  <path d="M16 15.62a1.12 1.12 0 1 0 0-2.24 1.12 1.12 0 0 0 0 2.24Z"></path>  <path fill-rule="evenodd" d="M16 16.5c-.73 0-2.19.36-2.24 1.08.5.71 1.32 1.17 2.24 1.17.92 0 1.74-.46 2.24-1.17-.05-.72-1.51-1.08-2.24-1.08Z" clip-rule="evenodd"></path>  <path fill-rule="evenodd" d="M17 10.09V5.27L9.5 2 2 5.27v4.91c0 4.54 3.2 8.79 7.5 9.82.55-.13 1.08-.32 1.6-.55A5.973 5.973 0 0 0 16 22c3.31 0 6-2.69 6-6 0-2.97-2.16-5.43-5-5.91ZM10 16c0 .56.08 1.11.23 1.62-.24.11-.48.22-.73.3-3.17-1-5.5-4.24-5.5-7.74v-3.6l5.5-2.4 5.5 2.4v3.51c-2.84.48-5 2.94-5 5.91Zm6 4c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4Z" clip-rule="evenodd"></path></svg>`,
    driverList: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M16.5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M5 10h5L9 21H6L5 10Z"></path><path d="M14 10h5l-1 11h-3l-1-11Z"></path></svg>`,
    maps: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>`,
    attendance: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M-74 29h48v48h-48V29zM0 0h24v24H0V0zm0 0h24v24H0V0z" fill="none"/><path d="M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15h-9V6h9v13z"/></svg>`,
    editChildren: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>`,
    shuttleHistory: `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 8v4l2 2"></path><path d="M3.05 11.002a9 9 0 1 1 .5 4"></path><path d="M3.05 20.002v-5h5"></path></svg>`,
  };

  getSvgIcon(iconName: string): SafeHtml {
    const svgMarkup = this.svgIcons[iconName] || '';
    return this.sanitizer.bypassSecurityTrustHtml(svgMarkup);
  }

  matchesSearch(item: Item): boolean {
    return (
      !this.searchText ||
      item.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  sectionMatchesSearch(section: Section): boolean {
    return section.items.some(this.matchesSearch.bind(this));
  }

  async ngOnInit(): Promise<void> {
    await this.fetchProfileData();

    this.loadMenuByRole(this.role_code);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('sidebar timezone', timezone);
  }

  async fetchProfileData(): Promise<void> {
    try {
      this.profileService.profileData$.subscribe((data) => {
        console.log('sidebar', data.user_role_code);

        if (data) {
          this.user_id = data.user_uuid;
          this.email = data.user_email;
          this.user_username = data.user_username;
          this.first_name = data.user_details.user_first_name;
          this.last_name = data.user_details.user_last_name;
          this.password = data.password;
          this.status = data.status;
          this.role_code = data.user_role_code;
          this.role = data.user_role;
          this.picture = data.picture;

          this.initialAvatar =
            this.first_name.charAt(0).toUpperCase() +
            this.last_name.charAt(0).toUpperCase();
        }
        console.log('sidebar fetch profile', this.email);
      });
    } catch (error) {
      console.error('Error fetching profile data in sidebar', error);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isSidebarVisible']) {
    }
  }

  closeSidebar() {
    this.close.emit();
  }

  onNavigate() {
    this.closeSidebar();
  }

  loadMenuByRole(role: string): void {
    if (role === 'SA') {
      this.role = 'Super Admin';
      this.sections = [
        {
          title: 'MAIN',
          items: [
            {
              name: 'Dashboard',
              icon: 'dashboard',
              path: '/superadmin/dashboard',
            },
          ],
        },
        {
          title: 'SA MANAGEMENT',
          items: [
            {
              name: 'Superadmin Lists',
              icon: 'studentList',
              path: '/superadmin/superadmins',
            },
          ],
        },
        {
          title: 'SCHOOL MANAGEMENT',
          items: [
            {
              name: 'School Lists',
              icon: 'schoolList',
              path: '/superadmin/schools',
            },
            {
              name: 'School Admin Lists',
              icon: 'adminList',
              path: '/superadmin/admins',
            },
          ],
        },
        {
          title: 'DRIVER MANAGEMENT',
          items: [
            {
              name: 'Vehicle Lists',
              icon: 'car',
              path: '/superadmin/vehicles',
            },
            {
              name: 'Driver Lists',
              icon: 'driverList',
              path: '/superadmin/drivers',
            },
            // {
            //   name: 'Routes Active',
            //   icon: 'routeList',
            //   path: '/superadmin/routes',
            // },
          ],
        },
      ];
    } else if (role === 'AS') {
      this.role = 'School Admin';
      this.sections = [
        {
          title: 'MAIN',
          items: [
            {
              name: 'Dashboard',
              icon: 'dashboard',
              path: '/admin/dashboard',
            },
          ],
        },
        {
          title: 'SCHOOL MANAGEMENT',
          items: [
            {
              name: 'Student List',
              icon: 'studentList',
              path: '/admin/students',
            },
          ],
        },
        {
          title: 'DRIVER MANAGEMENT',
          items: [
            {
              name: 'Vehicle Lists',
              icon: 'car',
              path: '/admin/vehicles',
            },
            {
              name: 'Driver Lists',
              icon: 'car',
              path: '/admin/drivers',
            },
            {
              name: 'Driver Monitoring',
              icon: 'studentList',
              path: '/admin/driver-monitoring',
            },
          ],
        },
        {
          title: 'ROUTE ASSIGNMENT',
          items: [
            {
              name: 'Route and Driver Assignment',
              icon: 'routeList',
              path: '/admin/routes',
            },
          ],
        },
      ];
    } else if (role === 'P') {
      this.role = 'Parent';
      this.sections = [
        {
          title: 'MAIN',
          items: [
            {
              name: 'Dashboard',
              icon: 'dashboard',
              path: '/parent/dashboard',
            },
          ],
        },
        {
          title: 'CHILD MANAGEMENT',
          items: [
            {
              name: 'Track Your Children',
              icon: 'maps',
              path: '/parent/tracking',
            },
            {
              name: 'Attendance Recap',
              icon: 'attendance',
              path: '/parent/attendance',
            },
            {
              name: 'Child Data',
              icon: 'editChildren',
              path: '/parent/my-childern',
            },
          ],
        },
      ];
    } else if (role === 'D') {
      this.role = 'Driver';
      this.sections = [
        {
          title: 'MAIN',
          items: [
            {
              name: 'Dashboard',
              icon: 'dashboard',
              path: '/driver/dashboard',
            },
          ],
        },
        {
          title: 'ROUTE MANAGEMENT',
          items: [
            {
              name: 'Shuttle',
              icon: 'car',
              path: '/driver/shuttle',
            },
            {
              name: 'Shuttle History',
              icon: 'shuttleHistory',
              path: '/driver/shuttle-history',
            },
          ],
        },
        {
          title: 'STUDENT MANAGEMENT',
          items: [
            {
              name: 'Student Lists',
              icon: 'studentList',
              path: '/driver/not-found',
            },
          ],
        },
      ];
    }
  }

  onLogout() {
    this.isModalDeleteOpen = true;
  }

  closeDeleteModal() {
    this.isModalDeleteOpen = false;
  }

  performLogout() {
    const token = this.cookieService.get('accessToken');
    axios
      .post(
        `${this.apiUrl}/api/logout`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        },
      )
      .then((response) => {
        console.log(token);

        this.profileService.resetProfileData();
        this.router.navigateByUrl('/login');
        this.cookieService.delete('accessToken', '/');
        this.cookieService.delete('refreshToken', '/');
        this.router.navigateByUrl('/login');

        console.log(response.data.message);
        Swal.fire({
          title: 'Success',
          text: 'Logout Berhasil',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.log(token);
        if (error.response.status === 401) {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
          });
        }
      });
  }
}
