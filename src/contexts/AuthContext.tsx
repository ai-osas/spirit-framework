"use client";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredTokens, storeAuthTokens, removeStoredTokens } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (tokens: { access_token: string; refresh_token: string }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = useCallback(async () => {
    try {
      console.log("Fetching user profile...");
      const tokens = getStoredTokens();
      if (!tokens?.access_token) {
        console.log("No access token found for profile fetch");
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me/`, {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Profile fetch failed:", errorText);
        throw new Error(`Failed to fetch user profile: ${response.status}`);
      }
  
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      console.log("Attempting to refresh token...");
      const tokens = getStoredTokens();
      if (!tokens?.refresh_token) {
        console.log("No refresh token found");
        return false;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: tokens.refresh_token,
        }),
      });

      if (!response.ok) throw new Error('Token refresh failed');
      const data = await response.json();
      
      console.log("Token refreshed successfully");
      storeAuthTokens({
        access_token: data.access,
        refresh_token: tokens.refresh_token,
      });
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  }, []);

  const login = useCallback(async (tokens: { access_token: string; refresh_token: string }) => {
    console.log("Login called with tokens");
    storeAuthTokens(tokens);
    setIsAuthenticated(true);
    
    try {
      const userData = await fetchUserProfile();
      if (!userData) {
        console.warn("Login successful but failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching profile during login:", error);
    }
  }, [fetchUserProfile]);

  const logout = useCallback(() => {
    console.log("Logging out...");
    removeStoredTokens();
    setIsAuthenticated(false);
    setUser(null);
    router.push('/');
  }, [router]);

  // Handle authentication initialization
  useEffect(() => {
    let mounted = true;
    
    const initAuth = async () => {
      // Check URL for tokens first (for OAuth flow)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshTokenParam = urlParams.get('refresh_token');
        
        if (accessToken && refreshTokenParam) {
          console.log("Found tokens in URL, logging in...");
          await login({
            access_token: accessToken,
            refresh_token: refreshTokenParam
          });
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          if (mounted) setLoading(false);
          return;
        }
      }

      // Then check stored tokens
      const tokens = getStoredTokens();
      if (tokens?.access_token) {
        console.log("Found stored tokens, refreshing...");
        const isValid = await refreshToken();
        if (isValid && mounted) {
          await fetchUserProfile();
        }
      }
      if (mounted) setLoading(false);
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [login, refreshToken, fetchUserProfile]);

  // Handle token refresh interval
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    
    if (isAuthenticated) {
      refreshInterval = setInterval(async () => {
        const success = await refreshToken();
        if (!success) {
          console.warn("Token refresh failed in interval");
        }
      }, 4 * 60 * 1000); // Refresh every 4 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [isAuthenticated, refreshToken]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      refreshToken,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};