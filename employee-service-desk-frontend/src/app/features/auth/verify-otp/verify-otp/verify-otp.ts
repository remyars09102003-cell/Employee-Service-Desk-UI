import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
// import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './verify-otp.html'
})
export class VerifyOtpComponent {

  email = '';
  otp = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.email =
      this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  verifyOtp(): void {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email) {
      this.errorMessage =
        'Email address is missing. Please request a new OTP.';
      return;
    }

    if (!/^[0-9]{6}$/.test(this.otp)) {
      this.errorMessage =
        'Please enter the six-digit OTP sent to your email.';
      return;
    }

    this.loading = true;

    this.authService.verifyOtp({
      email: this.email,
      otp: this.otp
    }).subscribe({

      next: () => {
        this.loading = false;

        // Continue to the password reset page after successful verification.
        this.router.navigate(['/reset-password'], {
          queryParams: {
            email: this.email,
            otp: this.otp
          }
        });
      },

      error: (error: any) => {
        this.loading = false;

        this.errorMessage =
          error.error?.message ??
          'OTP verification failed. Check the code and try again.';

        console.error('OTP verification error:', error);
      }

    });
  }
}