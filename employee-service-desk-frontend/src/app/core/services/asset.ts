
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

export interface Asset {
  id: number;
  name: string;
  assetTag: string;
  assetType: string;
  serialNumber: string;
  status: string;
  assignedTo?: string | null;
  purchaseDate?: string | null;
}

export interface CreateAssetRequest {
  name: string;
  assetTag: string;
  assetType: string;
  serialNumber: string;
  status: string;
  purchaseDate?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private readonly api = inject(ApiService);

  getAssets(): Observable<Asset[]> {
    return this.api.get<Asset[]>('/assets');
  }

  getAsset(id: number): Observable<Asset> {
    return this.api.get<Asset>(`/assets/${id}`);
  }

  createAsset(request: CreateAssetRequest): Observable<Asset> {
    return this.api.post<Asset>('/assets', request);
  }

  updateAsset(
    id: number,
    request: CreateAssetRequest
  ): Observable<Asset> {
    return this.api.put<Asset>(`/assets/${id}`, request);
  }

  deleteAsset(id: number): Observable<void> {
    return this.api.delete<void>(`/assets/${id}`);
  }

  assignAsset(id: number, employeeId: number): Observable<unknown> {
    return this.api.post<unknown>(`/assets/${id}/assign`, {
      employeeId
    });
  }

  returnAsset(id: number): Observable<unknown> {
    return this.api.post<unknown>(`/assets/${id}/return`, {});
  }
}