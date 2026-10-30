
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../../../../models/Department/department';

export interface DepartmentRequest {
  name: string;
  description: string;
  managerId: number | null;
  locationId: number | null;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/departments';

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  create(request: DepartmentRequest): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, request);
  }

  update(
    id: number,
    request: DepartmentRequest
  ): Observable<Department> {
    return this.http.put<Department>(
      `${this.apiUrl}/${id}`,
      request
    );
  }

  deactivate(id: number): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/deactivate`,
      {}
    );
  }
}

