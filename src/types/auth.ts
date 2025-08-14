export type BackendUser = { id: number; email: string; name: string | null };
export type BackendAuthTokens = {
  access: string;
  refresh: string;
  user?: BackendUser;
};

export type User = { id: number; email: string; name?: string };
export type AuthTokens = { access: string; refresh: string; user?: User };

export type Session = AuthTokens;
