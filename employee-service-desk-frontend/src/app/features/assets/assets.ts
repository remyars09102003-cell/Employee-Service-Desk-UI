
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import {
  Asset,
  AssetService,
  CreateAssetRequest
} from '../../core/services/asset';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assets.html',
  styleUrl: './assets.scss'
})
export class Assets implements OnInit {
  private readonly assetService = inject(AssetService);

  assets: Asset[] = [];

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  searchTerm = '';
  statusFilter = 'All';

  showForm = false;
  editingId: number | null = null;

  form: CreateAssetRequest = this.emptyForm();

  private emptyForm(): CreateAssetRequest {
    return {
      name: '',
      assetTag: '',
      assetType: '',
      serialNumber: '',
      status: 'Available',
      purchaseDate: null
    };
  }

  get filteredAssets(): Asset[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.assets.filter(asset => {
      const matchesSearch =
        !query ||
        [
          asset.name,
          asset.assetTag,
          asset.assetType,
          asset.serialNumber ?? '',
          asset.assignedTo ?? ''
        ].some(value => value.toLowerCase().includes(query));

      const matchesStatus =
        this.statusFilter === 'All' ||
        asset.status.toLowerCase() === this.statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

  get totalAssets(): number {
    return this.assets.length;
  }

  get availableCount(): number {
    return this.assets.filter(
      asset => asset.status.toLowerCase() === 'available'
    ).length;
  }

  get assignedCount(): number {
    return this.assets.filter(
      asset =>
        asset.status.toLowerCase() === 'inuse' ||
        asset.status.toLowerCase() === 'assigned' ||
        !!asset.assignedTo
    ).length;
  }

  get repairCount(): number {
    return this.assets.filter(
      asset => asset.status.toLowerCase() === 'repair'
    ).length;
  }

  get retiredCount(): number {
    return this.assets.filter(
      asset => asset.status.toLowerCase() === 'retired'
    ).length;
  }

  ngOnInit(): void {
    this.loadAssets();
  }

  loadAssets(): void {
    this.loading = true;
    this.errorMessage = '';

    this.assetService.getAssets().subscribe({
      next: data => {
        this.assets = data ?? [];
        this.loading = false;
      },
      error: error => {
        console.error('Failed to load assets:', error);
        this.errorMessage =
          'Could not load assets. Check that the backend API is running.';
        this.loading = false;
      }
    });
  }

  openAddForm(): void {
    this.editingId = null;
    this.form = this.emptyForm();
    this.showForm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  editAsset(asset: Asset): void {
    this.editingId = asset.id;

    this.form = {
      name: asset.name,
      assetTag: asset.assetTag,
      assetType: asset.assetType,
      serialNumber: asset.serialNumber ?? '',
      status: asset.status,
      purchaseDate: asset.purchaseDate
        ? asset.purchaseDate.substring(0, 10)
        : null
    };

    this.showForm = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form = this.emptyForm();
  }

  saveAsset(formDirective: NgForm): void {
    if (formDirective.invalid || this.saving) {
      formDirective.control.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const id = this.editingId;
    const request: CreateAssetRequest = {
      name: this.form.name.trim(),
      assetTag: this.form.assetTag.trim(),
      assetType: this.form.assetType.trim(),
      serialNumber: this.form.serialNumber.trim(),
      status: this.form.status,
      purchaseDate: this.form.purchaseDate || null
    };

    const operation$ =
      id === null
        ? this.assetService.createAsset(request)
        : this.assetService.updateAsset(id, request);

    operation$.subscribe({
      next: () => {
        this.saving = false;
        this.cancelForm();

        this.successMessage =
          id === null
            ? 'Asset created successfully.'
            : 'Asset updated successfully.';

        this.loadAssets();
      },
      error: error => {
        console.error('Failed to save asset:', error);
        this.saving = false;
        this.errorMessage =
          error?.error?.message ??
          'Unable to save the asset. Check the entered details.';
      }
    });
  }

  deleteAsset(asset: Asset): void {
    if (
      !window.confirm(
        `Are you sure you want to delete ${asset.assetTag} — ${asset.name}?`
      )
    ) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.assetService.deleteAsset(asset.id).subscribe({
      next: () => {
        this.successMessage = 'Asset deleted successfully.';
        this.loadAssets();
      },
      error: error => {
        console.error('Failed to delete asset:', error);
        this.errorMessage =
          error?.error?.message ?? 'Unable to delete this asset.';
      }
    });
  }

  assignAsset(asset: Asset): void {
    const input = window.prompt(
      `Enter the employee ID to assign ${asset.name} to:`
    );

    if (input === null) {
      return;
    }

    const employeeId = Number(input.trim());

    if (!Number.isInteger(employeeId) || employeeId < 1) {
      this.errorMessage = 'Enter a valid positive employee ID.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.assetService.assignAsset(asset.id, employeeId).subscribe({
      next: () => {
        this.successMessage = 'Asset assigned successfully.';
        this.loadAssets();
      },
      error: error => {
        console.error('Failed to assign asset:', error);
        this.errorMessage =
          error?.error?.message ??
          'Unable to assign the asset. Check the employee ID.';
      }
    });
  }

  returnAsset(asset: Asset): void {
    if (!window.confirm(`Record the return of ${asset.name}?`)) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.assetService.returnAsset(asset.id).subscribe({
      next: () => {
        this.successMessage = 'Asset return recorded successfully.';
        this.loadAssets();
      },
      error: error => {
        console.error('Failed to return asset:', error);
        this.errorMessage =
          error?.error?.message ?? 'Unable to return this asset.';
      }
    });
  }

  isAssigned(asset: Asset): boolean {
    return (
      asset.status.toLowerCase() === 'inuse' ||
      asset.status.toLowerCase() === 'assigned' ||
      !!asset.assignedTo
    );
  }

  trackByAssetId(_index: number, asset: Asset): number {
    return asset.id;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'All';
  }
}
