export interface IAuthState {
    isAuthenticated: boolean;
    token: {
      accessToken: string;
      refreshToken?: string;
    };
  }
  