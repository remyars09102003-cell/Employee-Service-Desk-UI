export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  userName: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken?: string;
}