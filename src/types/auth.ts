export interface UserInfo {
  userId: string;
  username: string;
  email?: string;
  givenName?: string;
  familyName?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
}

export interface AuthError {
  message: string;
  code?: string;
}
