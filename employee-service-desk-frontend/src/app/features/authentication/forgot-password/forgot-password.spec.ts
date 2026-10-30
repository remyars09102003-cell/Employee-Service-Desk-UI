
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { ForgotPasswordComponent } from './forgot-password';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  const authService = {
    forgotPassword: vi.fn(() => of({})),
    resetPassword: vi.fn(() => of({}))
  };

  beforeEach(async () => {
    authService.forgotPassword.mockClear();
    authService.resetPassword.mockClear();

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requests an OTP using the entered email address', () => {
    component.email = '  employee@company.com  ';

    component.sendOtp();

    expect(authService.forgotPassword).toHaveBeenCalledWith({
      email: 'employee@company.com'
    });
    expect(component.otpSent).toBe(true);
  });

  it('shows an error and clears the loading state when sending the OTP fails', () => {
    authService.forgotPassword.mockReturnValue(
      throwError(() => new Error('Network error'))
    );
    component.email = 'employee@company.com';

    component.sendOtp();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toContain('Unable to send a verification code');
  });
});
