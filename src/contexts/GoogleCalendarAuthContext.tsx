import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface GoogleCalendarAuthContextType {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  authenticate: () => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

const GoogleCalendarAuthContext = createContext<GoogleCalendarAuthContextType | undefined>(undefined);

export const useGoogleCalendarAuth = () => {
  const context = useContext(GoogleCalendarAuthContext);
  if (context === undefined) {
    throw new Error('useGoogleCalendarAuth must be used within a GoogleCalendarAuthProvider');
  }
  return context;
};

interface GoogleCalendarAuthProviderProps {
  children: ReactNode;
}

export const GoogleCalendarAuthProvider: React.FC<GoogleCalendarAuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Check for existing tokens on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('google_access_token');
    const storedRefreshToken = localStorage.getItem('google_refresh_token');
    
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setIsAuthenticated(true);
      console.log('Found existing Google Calendar tokens');
    }
  }, []);

  // Check for OAuth callback parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const error = urlParams.get('error');
    
    if (error) {
      console.error('OAuth error:', error);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    if (accessToken) {
      console.log('OAuth callback received tokens');
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setIsAuthenticated(true);
      
      // Store tokens in localStorage
      localStorage.setItem('google_access_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('google_refresh_token', refreshToken);
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const authenticate = useCallback(async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      // Get the OAuth URL from our edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/google-oauth?action=auth-url`);
      
      if (!response.ok) {
        throw new Error('Failed to get OAuth URL');
      }
      
      const { auth_url } = await response.json();
      
      console.log('Redirecting to Google OAuth:', auth_url);
      
      // Use redirect instead of popup
      window.location.href = auth_url;
      
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    console.log('Logged out from Google Calendar');
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/google-oauth?action=refresh&refresh_token=${refreshToken}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to refresh access token');
      }
      
      const { access_token } = await response.json();
      
      setAccessToken(access_token);
      localStorage.setItem('google_access_token', access_token);
      
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, user needs to re-authenticate
      logout();
      throw error;
    }
  }, [refreshToken, logout]);

  const value: GoogleCalendarAuthContextType = {
    isAuthenticated,
    accessToken,
    refreshToken,
    authenticate,
    logout,
    refreshAccessToken,
  };

  return (
    <GoogleCalendarAuthContext.Provider value={value}>
      {children}
    </GoogleCalendarAuthContext.Provider>
  );
};
