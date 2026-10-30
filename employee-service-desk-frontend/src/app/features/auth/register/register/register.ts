
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // =========================
  // Form fields
  // =========================

  userName = '';
  email = '';
  password = '';
  confirmPassword = '';

  // Default role
  role = 1;

  // =========================
  // Available roles
  // =========================

  roles = [
    {
      name: 'Employee',
      value: 1
    },
    {
      name: 'ServiceDeskAgent',
      value: 2
    },
    {
      name: 'ServiceDeskManager',
      value: 3
    },
    {
      name: 'Administrator',
      value: 4
    }
  ];

  // =========================
  // Messages
  // =========================

  errorMessage = '';
  successMessage = '';

  // =========================
  // Loading
  // =========================

  loading = false;

  // =========================
  // Submit
  // =========================

  onSubmit(): void {

    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    // =========================
    // Required field validation
    // =========================

    if (
      !this.userName.trim() ||
      !this.email.trim() ||
      !this.password ||
      !this.confirmPassword
    ) {

      this.errorMessage =
        'Please complete all required fields.';

      this.showError(
        'Please complete all required fields.'
      );

      return;
    }

    // =========================
    // Password validation
    // =========================

    if (this.password.length < 8) {

      this.errorMessage =
        'Password must contain at least 8 characters.';

      this.showError(
        'Password must contain at least 8 characters.'
      );

      return;
    }

    // =========================
    // Confirm password
    // =========================

    if (this.password !== this.confirmPassword) {

      this.errorMessage =
        'Passwords do not match.';

      this.showError(
        'Passwords do not match.'
      );

      return;
    }

    // =========================
    // Start loading
    // =========================

    this.loading = true;

    // =========================
    // Registration API call
    // =========================

    this.authService.register({
      userName: this.userName.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role
    }).subscribe({

      // =========================
      // Success
      // =========================

      next: () => {

        this.loading = false;

        this.successMessage =
          'Registration successful. Please sign in.';

        this.showSuccess(
          'Registration successful. Please sign in.'
        );

        // Navigate to login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },

      // =========================
      // Error
      // =========================

      error: (error: any) => {

        this.loading = false;

        const message =
          error?.error?.message ??
          error?.error?.title ??
          'Registration failed. Please try again.';

        this.errorMessage = message;

        this.showError(message);
      }
    });
  }

  // =========================
  // Success Snackbar
  // =========================

  private showSuccess(message: string): void {

    this.snackBar.open(
      message,
      'Close',
      {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    );
  }

  // =========================
  // Error Snackbar
  // =========================

  private showError(message: string): void {

    this.snackBar.open(
      message,
      'Close',
      {
        duration: 4000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      }
    );
  }
}

