export interface Employee {
  id: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  departmentId: number;
  jobTitle?: string;
}