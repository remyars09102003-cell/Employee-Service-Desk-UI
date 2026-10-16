import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from '../../core/services/api';

interface DashboardBreakdown { label: string; count: number; }
interface DashboardSummary {
  totalAssets: number; totalAssetTypes: number; totalAssignments: number;
  assetsByStatus: DashboardBreakdown[]; assetsByType: DashboardBreakdown[];
}
interface FeedbackRecord {
  feedbackId?: number; rating?: number; status?: string; category?: string;
  employeeName?: string; comments?: string; createdAtUtc?: string;
}
type DashboardView = 'all' | 'assets' | 'feedback';
type StatCategory = 'assets' | 'feedback' | 'warranty';
interface DashboardStat {
  title: string; value: number; icon: string; description: string;
  category: StatCategory; route: string; tone: string;
}

@Component({
  selector: 'app-dashboard', standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html', styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly today = new Date();
  loading = true;
  errorMessage = '';
  searchTerm = '';
  lastUpdated: Date | null = null;
  activeView: DashboardView = 'all';
  assetsByStatus: DashboardBreakdown[] = [];
  assetsByType: DashboardBreakdown[] = [];
  feedbackByRating: DashboardBreakdown[] = [];
  feedbackByStatus: DashboardBreakdown[] = [];
  feedbackRecords: FeedbackRecord[] = [];
  totalAssets = 0;
  totalAssetTypes = 0;
  totalAssignments = 0;
  totalFeedback = 0;
  averageRating = 0;
  repairAssets = 0;
  retiredAssets = 0;
  expiredWarranties = 0;
  warrantiesExpiringSoon = 0;
  stats: DashboardStat[] = [];

  ngOnInit(): void { this.loadDashboard(); }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      dashboard: this.api.get<DashboardSummary>('/reports/dashboard'),
      feedback: this.api.get<FeedbackRecord[]>('/feedback').pipe(
        catchError(error => { console.error('Could not load feedback data:', error); return of([] as FeedbackRecord[]); })
      )
    }).subscribe({
      next: ({ dashboard, feedback }) => {
        this.totalAssets = dashboard.totalAssets ?? 0;
        this.totalAssetTypes = dashboard.totalAssetTypes ?? 0;
        this.totalAssignments = dashboard.totalAssignments ?? 0;
        this.assetsByStatus = dashboard.assetsByStatus ?? [];
        this.assetsByType = dashboard.assetsByType ?? [];
        this.feedbackRecords = Array.isArray(feedback) ? feedback : [];
        this.repairAssets = this.countStatus('repair', 'under repair');
        this.retiredAssets = this.countStatus('retired');
        // Warranty dates are not part of the current dashboard API contract.
        this.expiredWarranties = 0;
        this.warrantiesExpiringSoon = 0;
        this.totalFeedback = this.feedbackRecords.length;
        const ratings = this.feedbackRecords.map(item => Number(item.rating))
          .filter(value => Number.isFinite(value) && value >= 1 && value <= 5);
        this.averageRating = ratings.length ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10 : 0;
        this.feedbackByRating = this.groupBy(this.feedbackRecords, item =>
          item.rating && item.rating >= 1 && item.rating <= 5 ? `${item.rating} ★` : 'Unrated');
        this.feedbackByStatus = this.groupBy(this.feedbackRecords, item => item.status || 'Unknown');
        this.stats = [
          { title: 'Total Assets', value: this.totalAssets, icon: '▰', description: 'All registered hardware assets', category: 'assets', route: '/assets', tone: 'blue' },
          { title: 'Asset Types', value: this.totalAssetTypes, icon: '⬡', description: 'Different hardware categories', category: 'assets', route: '/assets', tone: 'violet' },
          { title: 'Total Assignments', value: this.totalAssignments, icon: '▤', description: 'Recorded asset assignments', category: 'assets', route: '/reports', tone: 'green' },
          { title: 'Under Repair', value: this.repairAssets, icon: '🔧', description: 'Assets needing maintenance', category: 'assets', route: '/assets', tone: 'orange' },
          { title: 'Retired Assets', value: this.retiredAssets, icon: '▣', description: 'Assets marked as retired', category: 'assets', route: '/assets', tone: 'red' },
          { title: 'Expired Warranties', value: this.expiredWarranties, icon: '⚠', description: 'Assets with expired warranties', category: 'warranty', route: '/assets', tone: 'amber' },
          { title: 'Warranties Expiring Soon', value: this.warrantiesExpiringSoon, icon: '◷', description: 'Expiring in next 30 days', category: 'warranty', route: '/assets', tone: 'cyan' },
          { title: 'Total Feedback', value: this.totalFeedback, icon: '●', description: 'Feedback submissions received', category: 'feedback', route: '/feedback-audit', tone: 'indigo' },
          { title: 'Average Rating', value: this.averageRating, icon: '★', description: 'Employee satisfaction score', category: 'feedback', route: '/feedback-audit', tone: 'pink' }
        ];
        this.lastUpdated = new Date();
        this.loading = false;
      },
      error: error => {
        console.error('Dashboard loading failed:', error);
        this.errorMessage = 'Unable to load dashboard data. Check the backend API and try again.';
        this.loading = false;
      }
    });
  }

  private countStatus(...terms: string[]): number {
    return this.assetsByStatus.filter(item => terms.includes(item.label.trim().toLowerCase()))
      .reduce((sum, item) => sum + item.count, 0);
  }
  private groupBy(records: FeedbackRecord[], getLabel: (item: FeedbackRecord) => string): DashboardBreakdown[] {
    const counts = new Map<string, number>();
    for (const item of records) { const label = getLabel(item); counts.set(label, (counts.get(label) ?? 0) + 1); }
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label));
  }
  get visibleStats(): DashboardStat[] {
    if (this.activeView === 'assets') return this.stats.filter(stat => stat.category === 'assets' || stat.category === 'warranty');
    if (this.activeView === 'feedback') return this.stats.filter(stat => stat.category === 'feedback');
    return this.stats;
  }
  setView(view: DashboardView): void { this.activeView = view; }
  selectStat(stat: DashboardStat): void { void this.router.navigateByUrl(stat.route); }
  get filteredAssetsByStatus(): DashboardBreakdown[] { return this.filterRows(this.assetsByStatus); }
  get filteredAssetsByType(): DashboardBreakdown[] { return this.filterRows(this.assetsByType); }
  get filteredFeedbackByRating(): DashboardBreakdown[] { return this.filterRows(this.feedbackByRating); }
  get filteredFeedbackByStatus(): DashboardBreakdown[] { return this.filterRows(this.feedbackByStatus); }
  private filterRows(rows: DashboardBreakdown[]): DashboardBreakdown[] {
    const query = this.searchTerm.trim().toLowerCase();
    return query ? rows.filter(row => row.label.toLowerCase().includes(query)) : rows;
  }
  getBarWidth(item: DashboardBreakdown, rows: DashboardBreakdown[]): number {
    const max = Math.max(0, ...rows.map(row => row.count));
    return max === 0 ? 0 : Math.max(item.count > 0 ? 3 : 0, item.count / max * 100);
  }
  getBarPercent(item: DashboardBreakdown, rows: DashboardBreakdown[]): number {
    const total = rows.reduce((sum, row) => sum + row.count, 0);
    return total ? Math.round(item.count / total * 100) : 0;
  }
  trackByLabel(_index: number, item: DashboardBreakdown): string { return item.label; }
  clearFilters(): void { this.searchTerm = ''; }
  exportCsv(): void {
    const rows: string[][] = [ ['Report', 'Label', 'Count'],
      ...this.assetsByStatus.map(item => ['Assets by status', item.label, String(item.count)]),
      ...this.assetsByType.map(item => ['Assets by type', item.label, String(item.count)]),
      ...this.feedbackByRating.map(item => ['Feedback by rating', item.label, String(item.count)]),
      ...this.feedbackByStatus.map(item => ['Feedback by status', item.label, String(item.count)]),
      ['Feedback summary', 'Total feedback', String(this.totalFeedback)],
      ['Feedback summary', 'Average rating', String(this.averageRating)] ];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `service-desk-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  }
}
