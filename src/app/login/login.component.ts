import { Component, Inject } from '@angular/core';
import axios from 'axios';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

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
    password: '',
  };

  emailError: string = '';
  passwordError: string = '';

  private apiUrl: string;

  constructor(
    private router: Router,
    private cookieService: CookieService,
    @Inject('apiUrl') apiUrl: string
  ) {
    this.apiUrl = apiUrl;
  }
  redirectUrl: any = localStorage.getItem('redirectUrl');

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
          const fetchRoleCode = await axios.get(
            `${this.apiUrl}/api/my/profile`,
            {
              headers: { Authorization: `${access_token}` },
            }
          );

          const roleCode = fetchRoleCode.data.role_code;

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
              this.router.navigate(['/not-found']);
              break;
          }
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
