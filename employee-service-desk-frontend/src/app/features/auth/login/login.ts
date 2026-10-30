import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
selector: 'app-login',
standalone: true,
imports: [CommonModule, FormsModule, RouterLink],
templateUrl: './login.html',
styleUrl: './login.scss'
})
export class LoginComponent {

email = '';
password = '';
loading = false;
errorMessage = '';
successMessage = '';

constructor(
private authService: AuthService,
private router: Router
) {}

onSubmit(): void {


this.errorMessage = '';
this.successMessage = '';

if (this.loading) {
  return;
}

// Validate required fields
if (!this.email.trim() || !this.password) {
  this.errorMessage = 'Please enter your email and password.';
  return;
}

// Validate email format
const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
  this.email.trim()
);

if (!validEmail) {
  this.errorMessage = 'Please enter a valid email address.';
  return;
}

this.loading = true;

// Send login request
this.authService.login({
  email: this.email.trim(),
  password: this.password
}).subscribe({

  next: (response) => {

    console.log('LOGIN RESPONSE:', response);

    const loginData = response?.data;

    if (!loginData?.accessToken) {
      this.loading = false;
      this.errorMessage = 'Authentication token is missing.';
      return;
    }

    // AuthService already saves login details
    const role = loginData.role;

    console.log('Logged-in user:', loginData.userName);
    console.log('Logged-in role:', role);

    this.loading = false;
    this.successMessage = 'Login successful!';

    // Navigate to dashboard
    this.router.navigate(['/dashboard']).then(
      navigated => {
        if (!navigated) {
          this.errorMessage = 'Dashboard navigation failed. Check app.routes.ts.';
        }
      }
    );

  },

  error: (error) => {

    console.error('LOGIN ERROR:', error);

    this.loading = false;

    if (error.status === 0) {
      this.errorMessage = 'Cannot connect to the backend. Check whether the API is running.';
    }
    else if (error.status === 400) {
      this.errorMessage = error.error?.message ?? 'Invalid login request.';
    }
    else if (error.status === 401) {
      this.errorMessage = error.error?.message ?? 'Invalid email or password.';
    }
    else {
      this.errorMessage = error.error?.message ?? 'Login failed. Please try again.';
    }
  }
});


}
}
