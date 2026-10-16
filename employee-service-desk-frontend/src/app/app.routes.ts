import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'assets',
    loadComponent: () =>
      import('./features/assets/assets')
        .then(m => m.Assets)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard')
        .then(m => m.Dashboard)
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/reports/reports')
        .then(m => m.Reports)
  },
  {
    path: 'feedback-audit',
    loadComponent: () =>
      import('./features/feedback-audit/feedback-audit')
        .then(m => m.FeedbackAudit)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];