import { Injectable } from '@angular/core';
import {
CanActivate,
Router,
UrlTree
} from '@angular/router';

import { AuthService } from '../services/auth';

@Injectable({
providedIn: 'root'
})
export class AuthGuard implements CanActivate {

constructor(
private authService: AuthService,
private router: Router
) {}

canActivate(): boolean | UrlTree {


console.log('AuthGuard executed.');
console.log('Current URL:', this.router.url);

const loggedIn = this.authService.isLoggedIn();

console.log('Is logged in:', loggedIn);

if (loggedIn) {
  console.log('Access granted.');
  return true;
}

console.log('AuthGuard redirecting to /login');

return this.router.createUrlTree(['/login']);


}
}
