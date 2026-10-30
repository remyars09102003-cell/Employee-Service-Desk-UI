import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

export interface Employee {
id: number;
employeeId: string;
firstName: string;
lastName: string;
email: string;
phone?: string | null;
designation?: string | null;
departmentName?: string | null;
joiningDate: string;
employmentStatus: string;
departmentId: number;
managerId?: number | null;
isActive: boolean;
}

export interface EmployeeRequest {
employeeId: string;
firstName: string;
lastName: string;
email: string;
phone: string;
designation: string;
joiningDate: string;
employmentStatus: string;
departmentId: number;
managerId: number | null;
isActive: boolean;
}

@Component({
selector: 'app-employees',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './employee.html',
styleUrl: './employee.scss'
})
export class EmployeesComponent implements OnInit {

private readonly http = inject(HttpClient);

private readonly apiUrl = '/api/employees';

employees: Employee[] = [];
filteredEmployees: Employee[] = [];

searchText = '';

loading = false;
saving = false;

errorMessage = '';
successMessage = '';

showForm = false;
editingId: number | null = null;

form: EmployeeRequest = this.emptyForm();

ngOnInit(): void {
this.loadEmployees();
}

// Empty employee form
emptyForm(): EmployeeRequest {
return {
employeeId: '',
firstName: '',
lastName: '',
email: '',
phone: '',
designation: '',
joiningDate: new Date().toISOString().slice(0, 10),
employmentStatus: 'Active',
departmentId: 0,
managerId: null,
isActive: true
};
}

// Load employees
loadEmployees(): void {
this.loading = true;
this.errorMessage = '';


this.http.get<Employee[]>(this.apiUrl).subscribe({

  next: (data) => {
    this.employees = Array.isArray(data) ? data : [];
    this.filterEmployees();
    this.loading = false;
  },

  error: (error: HttpErrorResponse) => {
    console.error('Load employees error:', error);

    this.errorMessage =
      error.error?.message ||
      'Could not load employees. Please check the API.';

    this.loading = false;
  }

});


}

// Search employees
filterEmployees(): void {
const query = this.searchText.trim().toLowerCase();


this.filteredEmployees = this.employees.filter(employee =>
  `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.employeeId}`
    .toLowerCase()
    .includes(query)
);


}

// Open Add Employee form
openCreateForm(): void {
this.editingId = null;
this.form = this.emptyForm();


this.showForm = true;
this.errorMessage = '';
this.successMessage = '';


}

// Open Edit Employee form
openEditForm(employee: Employee): void {
this.editingId = employee.id;


this.form = {
  employeeId: employee.employeeId,
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  phone: employee.phone ?? '',
  designation: employee.designation ?? '',
  joiningDate: employee.joiningDate
    ? employee.joiningDate.substring(0, 10)
    : '',
  employmentStatus: employee.employmentStatus,
  departmentId: Number(employee.departmentId),
  managerId: employee.managerId ?? null,
  isActive: employee.isActive
};

this.showForm = true;
this.errorMessage = '';
this.successMessage = '';


}

// Save or Update Employee
saveEmployee(): void {
if (this.saving) {
return;
}


this.errorMessage = '';
this.successMessage = '';

const departmentId = Number(this.form.departmentId);

const managerId =
  this.form.managerId === null ||
  this.form.managerId === undefined ||
  this.form.managerId === 0
    ? null
    : Number(this.form.managerId);

// Required field validation
if (
  !this.form.employeeId.trim() ||
  !this.form.firstName.trim() ||
  !this.form.lastName.trim() ||
  !this.form.email.trim() ||
  !this.form.joiningDate
) {
  this.errorMessage = 'Please complete all required fields.';
  return;
}

// Email validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailPattern.test(this.form.email.trim())) {
  this.errorMessage = 'Please enter a valid email address.';
  return;
}

// Department ID validation
if (!Number.isInteger(departmentId) || departmentId <= 0) {
  this.errorMessage =
    'Please enter a valid Department ID greater than 0.';
  return;
}

// Manager ID validation
if (
  managerId !== null &&
  (!Number.isInteger(managerId) || managerId <= 0)
) {
  this.errorMessage = 'Please enter a valid Manager ID.';
  return;
}

// Prepare employee request
const requestData: EmployeeRequest = {
  employeeId: this.form.employeeId.trim(),
  firstName: this.form.firstName.trim(),
  lastName: this.form.lastName.trim(),
  email: this.form.email.trim(),
  phone: this.form.phone.trim(),
  designation: this.form.designation.trim(),
  joiningDate: this.form.joiningDate,
  employmentStatus: this.form.employmentStatus,
  departmentId: departmentId,
  managerId: managerId,
  isActive: this.form.employmentStatus === 'Active'
};

this.saving = true;

const isEditing = this.editingId !== null;

const request = isEditing
  ? this.http.put(
      `${this.apiUrl}/${this.editingId}`,
      requestData
    )
  : this.http.post(
      this.apiUrl,
      requestData
    );

request.subscribe({

  next: () => {
    this.saving = false;
    this.showForm = false;
    this.editingId = null;
    this.form = this.emptyForm();

    this.successMessage = isEditing
      ? 'Employee updated successfully.'
      : 'Employee added successfully.';

    this.loadEmployees();
  },

  error: (error: HttpErrorResponse) => {
    this.saving = false;

    console.error('Save employee error:', error);

    if (error.error?.errors) {
      this.errorMessage = Object.entries(error.error.errors)
        .map(([field, messages]) =>
          `${field}: ${
            Array.isArray(messages)
              ? messages.join(', ')
              : messages
          }`
        )
        .join(' | ');
    } else {
      this.errorMessage =
        error.error?.message ||
        error.error?.title ||
        'Could not save employee. Please check the entered details and API.';
    }
  }

});


}

// Deactivate employee
deactivateEmployee(employee: Employee): void {
const confirmed = confirm(
`Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}?`
);


if (!confirmed) {
  return;
}

this.errorMessage = '';
this.successMessage = '';

this.http.patch<void>(
  `${this.apiUrl}/${employee.id}/deactivate`,
  {}
).subscribe({

  next: () => {
    this.successMessage = 'Employee deactivated successfully.';
    this.loadEmployees();
  },

  error: (error: HttpErrorResponse) => {
    console.error('Deactivate employee error:', error);

    this.errorMessage =
      error.error?.message ||
      'Could not deactivate employee.';
  }

});


}

// Cancel Add/Edit form
cancelForm(): void {
if (this.saving) {
return;
}


this.showForm = false;
this.editingId = null;
this.form = this.emptyForm();
this.errorMessage = '';


}

}


