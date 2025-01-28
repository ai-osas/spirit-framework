// src/lib/auth.ts
type AuthTokens = {
    access_token: string;
    refresh_token: string;
  };
  
  export const AUTH_STORAGE_KEY = 'spirit_auth';
  
  export const storeAuthTokens = (tokens: AuthTokens) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
    }
  };
  
  export const getStoredTokens = (): AuthTokens | null => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  };
  
  export const removeStoredTokens = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };
  
  export const isAuthenticated = (): boolean => {
    const tokens = getStoredTokens();
    return !!tokens?.access_token;
  };