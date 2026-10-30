
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  otpSent = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Send OTP to the email address
  sendOtp(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const email = this.email.trim();

    if (!email) {
      this.errorMessage = 'Please enter your email address.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    this.email = email;
    this.isLoading = true;

    this.authService
      .forgotPassword({ email })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          this.otpSent = true;
          this.successMessage =
            response?.message ?? 'Verification code sent successfully.';
        },
        error: (error: any) => {
          console.error('Send OTP error:', error);

          this.errorMessage =
            error?.error?.message ??
            'Unable to send a verification code. Please try again.';
        }
      });
  }

  // Reset password using the OTP
  resetPassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.otp.trim()) {
      this.errorMessage = 'Please enter the verification code.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage =
        'Your new password must contain at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'The passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService
      .resetPassword({
        email: this.email,
        otp: this.otp.trim(),
        newPassword: this.newPassword
      })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          this.successMessage =
            response?.message ??
            'Your password has been reset successfully.';

          this.otpSent = false;
          this.otp = '';
          this.newPassword = '';
          this.confirmPassword = '';

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          console.error('Reset password error:', error);

          this.errorMessage =
            error?.error?.message ??
            'Password reset failed. Check your OTP and try again.';
        }
      });
  }
}

