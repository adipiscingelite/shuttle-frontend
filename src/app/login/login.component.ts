import { Component, Inject } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../Services/profile/profile.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  errorMessage: string = '';

  loginData = {
    email: '',
    password: '12345678',
  };

  emailError: string = '';
  passwordError: string = '';

  private apiUrl: string;

  constructor(
    private profileService: ProfileService,
    private cookieService: CookieService,
    private router: Router,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }

  validateLogin(): boolean {
    this.emailError = '';
    this.passwordError = '';

    if (!this.loginData.email) {
      this.emailError = 'Email is required.';
    }

    if (!this.loginData.password) {
      this.passwordError = 'Password is required.';
    }

    if (this.emailError || this.passwordError) {
      return false;
    }

    return true;
  }

  async onLogin() {
    const isValid = this.validateLogin();

    if (!isValid) {
      return;
    }

    axios
      .post(`${this.apiUrl}/login`, this.loginData)
      .then(async (response) => {
        const { access_token, refresh_token } = response.data.data;
        this.cookieService.set('accessToken', access_token);
        this.cookieService.set('refreshToken', refresh_token);

        try {
          
        const profileData = await this.profileService.fetchProfileData();
          // const fetchRoleCode = await axios.get(
          //   `${this.apiUrl}/api/my/profile`,
          //   {
          //     headers: { Authorization: `${access_token}` },
          //   }
          // );

          const roleCode = profileData.role_code;      

          switch (roleCode) {
            case 'SA':
              this.router.navigate(['/superadmin']);
              break;
            case 'AS':
              this.router.navigate(['/admin']);
              break;
            case 'D':
              this.router.navigate(['/driver']);
              break;
            case 'P':
              this.router.navigate(['/parent']);
              break;
            default:
              this.router.navigate(['/jawa']);
              break;
          }

          console.log('saat login', roleCode);
          
        } catch (error) {
          console.error('Error fetching profile:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to fetch user role. Please try again.',
            icon: 'error',
          });
        }
      })
      .catch((error) => {
        if (error.response.status === 401) {
          this.errorMessage = error.response.data.message;
        } else if (error.response.status === 500) {
          this.errorMessage = 'Server error: ' + error.response.data.message;
        } else {
          this.errorMessage = 'An unexpected error occurred.';
        }
      });
  }

  forgor() {
    alert('passwordnya 12345678 kalo ga salah');
  }
}
