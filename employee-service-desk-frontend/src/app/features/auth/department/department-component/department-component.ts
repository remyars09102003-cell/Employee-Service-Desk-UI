import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
DepartmentService,
DepartmentRequest
} from '../department/department';

import { Department } from '../../../../models/Department/department';

@Component({
selector: 'app-department',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './department-component.html',
styleUrl: './department-component.scss'
})
export class DepartmentComponent implements OnInit {
private readonly departmentService = inject(DepartmentService);

departments: Department[] = [];
filteredDepartments: Department[] = [];

searchText = '';
loading = false;
showForm = false;

editingId: number | null = null;

errorMessage = '';
successMessage = '';

form: DepartmentRequest = this.createEmptyForm();

private createEmptyForm(): DepartmentRequest {
return {
name: '',
description: '',
managerId: null,
locationId: null,
isActive: true
};
}

ngOnInit(): void {
this.loadDepartments();
}

// Load all departments
loadDepartments(): void {
this.loading = true;
this.errorMessage = '';


this.departmentService.getAll().subscribe({
  next: (data: Department[]) => {
    this.departments = data ?? [];
    this.filterDepartments();
    this.loading = false;
  },
  error: (error: unknown) => {
    console.error('Error loading departments:', error);

    this.errorMessage =
      'Unable to load departments. Please try again.';

    this.loading = false;
  }
});


}

// Search departments
filterDepartments(): void {
const search = this.searchText.trim().toLowerCase();


this.filteredDepartments = this.departments.filter(department =>
  (department.name ?? '').toLowerCase().includes(search) ||
  (department.description ?? '').toLowerCase().includes(search)
);


}

// Count active departments
countActiveDepartments(): number {
return this.departments.filter(
department => department.isActive
).length;
}

// Count inactive departments
countInactiveDepartments(): number {
return this.departments.filter(
department => !department.isActive
).length;
}

// Open create form
openCreateForm(): void {
this.editingId = null;
this.form = this.createEmptyForm();
this.errorMessage = '';
this.successMessage = '';
this.showForm = true;
}

// Open edit form
openEditForm(department: Department): void {
this.editingId = department.id;

this.form = {
name: department.name ?? '',
description: department.description ?? '',
managerId: null,
locationId: null,
isActive: department.isActive
};

this.errorMessage = '';
this.successMessage = '';
this.showForm = true;
}

// Create or update department
saveDepartment(): void {
const request: DepartmentRequest = {
...this.form,
name: this.form.name.trim(),
description: (this.form.description ?? '').trim()
};


if (!request.name) {
  this.errorMessage = 'Department name is required.';
  return;
}

this.loading = true;
this.errorMessage = '';
this.successMessage = '';

const isCreating = this.editingId === null;

const operation = isCreating
  ? this.departmentService.create(request)
  : this.departmentService.update(this.editingId!, request);

operation.subscribe({
  next: () => {
    this.successMessage = isCreating
      ? 'Department created successfully.'
      : 'Department updated successfully.';

    this.showForm = false;
    this.editingId = null;
    this.form = this.createEmptyForm();

    this.loadDepartments();
  },
  error: (error: unknown) => {
    console.error('Error saving department:', error);

    this.errorMessage =
      'Unable to save department. Please check the API.';

    this.loading = false;
  }
});


}

// Close form
cancelForm(): void {
this.showForm = false;
this.editingId = null;
this.form = this.createEmptyForm();
this.errorMessage = '';
}

// Deactivate department
deactivateDepartment(department: Department): void {
const confirmed = confirm(
`Are you sure you want to deactivate "${department.name}"?`
);


if (!confirmed) {
  return;
}

this.loading = true;
this.errorMessage = '';
this.successMessage = '';

this.departmentService.deactivate(department.id).subscribe({
  next: () => {
    this.successMessage = 'Department deactivated successfully.';
    this.loadDepartments();
  },
  error: (error: unknown) => {
    console.error('Error deactivating department:', error);

    this.errorMessage = 'Unable to deactivate department.';
    this.loading = false;
  }
});


}
}
