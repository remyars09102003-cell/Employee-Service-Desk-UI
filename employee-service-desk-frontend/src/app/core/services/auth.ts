import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
email: string;
password: string;
}

export interface LoginResponseData {
userId: number;
userName: string;
email: string;
role: string;
accessToken: string;
refreshToken: string;
}

export interface AuthResponse {
message: string;
data: LoginResponseData;
}

@Injectable({
providedIn: 'root'
})
export class AuthService {

private readonly apiUrl = 'https://localhost:7293/api/auth';

constructor(private http: HttpClient) {}

// LOGIN AND SAVE USER DETAILS
login(data: LoginRequest): Observable<AuthResponse> {
return this.http.post<AuthResponse>(
`${this.apiUrl}/login`,
data
).pipe(
tap(response => {
const user = response?.data;


    if (!user?.accessToken) {
      throw new Error('Login response did not contain an authentication token.');
    }

    localStorage.setItem('token', user.accessToken);
    localStorage.setItem('accessToken', user.accessToken);
    localStorage.setItem('refreshToken', user.refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', String(user.userId));
    localStorage.setItem('userName', user.userName);
    localStorage.setItem('email', user.email);
    localStorage.setItem('role', user.role);
  })
);


}

// REGISTER
register(data: any): Observable<any> {
return this.http.post<any>(`${this.apiUrl}/register`, data);
}

// FORGOT PASSWORD
forgotPassword(data: { email: string }): Observable<any> {
return this.http.post<any>(
`${this.apiUrl}/forgot-password`,
data
);
}

// VERIFY OTP
verifyOtp(data: { email: string; otp: string }): Observable<any> {
return this.http.post<any>(
`${this.apiUrl}/verify-otp`,
data
);
}

// RESET PASSWORD
resetPassword(data: {
email: string;
otp: string;
newPassword: string;
confirmPassword?: string;
}): Observable<any> {
return this.http.post<any>(
`${this.apiUrl}/reset-password`,
data
);
}

// CHECK LOGIN STATUS
isLoggedIn(): boolean {
return !!localStorage.getItem('token');
}

// GET ACCESS TOKEN
getToken(): string | null {
return localStorage.getItem('token');
}

// GET CURRENT USER
getCurrentUser(): LoginResponseData | null {
const user = localStorage.getItem('user');


if (!user) {
  return null;
}

try {
  return JSON.parse(user) as LoginResponseData;
} catch {
  return null;
}


}

// GET CURRENT ROLE
getCurrentRole(): string {
return localStorage.getItem('role') ?? '';
}

// CHECK ROLE
hasRole(role: string): boolean {
return this.getCurrentRole().toLowerCase() === role.toLowerCase();
}

// LOGOUT
logout(): void {
localStorage.removeItem('token');
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
localStorage.removeItem('user');
localStorage.removeItem('userId');
localStorage.removeItem('userName');
localStorage.removeItem('email');
localStorage.removeItem('role');
}
}
