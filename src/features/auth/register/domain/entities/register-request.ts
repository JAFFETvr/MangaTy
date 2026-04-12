export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'ROLE_USER' | 'ROLE_CREATOR';
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    username: string;
    createdAt: Date;
  };
  token: string;
}
