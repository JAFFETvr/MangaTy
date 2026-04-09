export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
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
