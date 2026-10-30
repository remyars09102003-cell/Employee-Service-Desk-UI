import { Routes } from '@angular/router';

import { ForgotPasswordComponent } from './features/authentication/forgot-password/forgot-password';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register/register';
import { VerifyOtpComponent } from './features/auth/verify-otp/verify-otp/verify-otp';
// import { EmployeesComponent } from './features/employees/employees';
import { DepartmentComponent } from './features/auth/department/department-component/department-component';
import { EmployeesComponent } from './features/auth/employee/employee/employee';

export const routes: Routes = [
{
path: 'login',
component: LoginComponent
},
{
path: 'register',
component: RegisterComponent
},
{
path: 'forgot-password',
component: ForgotPasswordComponent
},
{
path: 'verify-otp',
component: VerifyOtpComponent
},
{
path: 'employees',
component: EmployeesComponent
},
{
path: 'department',
component: DepartmentComponent
},
{
path: 'dashboard',
loadComponent: () =>
import('./features/dashboard/dashboard')
.then(m => m.Dashboard)
},
{
path: '',
redirectTo: 'login',
pathMatch: 'full'
},
{
path: '**',
redirectTo: 'login'
}
];
