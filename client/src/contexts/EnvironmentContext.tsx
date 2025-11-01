/*
 *
 * Copyright (c) 2025 Alexander Orlov.
 * 34 Middletown Ave Atlantic Highlands NJ 07716
 *
 * THIS SOFTWARE IS THE CONFIDENTIAL AND PROPRIETARY INFORMATION OF
 * Alexander Orlov. ("CONFIDENTIAL INFORMATION"). YOU SHALL NOT DISCLOSE
 * SUCH CONFIDENTIAL INFORMATION AND SHALL USE IT ONLY IN ACCORDANCE
 * WITH THE TERMS OF THE LICENSE AGREEMENT YOU ENTERED INTO WITH
 * Alexander Orlov.
 *
 * Author: Alexander Orlov
 *
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { updateApiBaseUrl, authApi } from '../services/api';
import api from '../services/api';

export type Environment = 'development' | 'production';

interface EnvironmentContextType {
  environment: Environment;
  setEnvironment: (env: Environment, logout?: () => void) => void;
  baseUrl: string;
  huurApiUrl: string;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

interface EnvironmentProviderProps {
  children: React.ReactNode;
}

export const EnvironmentProvider: React.FC<EnvironmentProviderProps> = ({ children }) => {
  const [environment, setEnvironment] = useState<Environment>(() => {
    // Load from localStorage or default to production
    const saved = localStorage.getItem('huur-environment');
    const env = (saved as Environment) || 'production';
    console.log('🏁 Environment initialized:', env, 'from localStorage:', saved || 'default');
    return env;
  });

  const [actualHuurApiUrl, setActualHuurApiUrl] = useState<string>('Loading...');
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // Frontend API URL - when running on Static Web Apps, this SHOULD be absolute
  // to avoid calling non-existent /api on the SWA host. Fallback to '/api' for
  // same-origin deployments (e.g., Azure App Service hosting both API and UI).
  const baseUrl = process.env.REACT_APP_API_URL || '/api';
  const isAbsoluteApiBase = /^https?:\/\//i.test(baseUrl);

  // Fetch actual Huur API URL from backend with debouncing and rate limiting
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchActualHuurApiUrl = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    
    // Rate limiting: don't fetch more than once every 5 seconds
    if (!force && timeSinceLastFetch < 5000) {
      console.log('⏳ Rate limiting: skipping API fetch (too recent)');
      return;
    }

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce the request
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        // If API base is not absolute (e.g., '/api'), and we're hosted on SWA,
        // skip fetching backend config to avoid 404s and use fallback URLs.
        const isStaticWebAppsHost = typeof window !== 'undefined' && /\.azurestaticapps\.net$/i.test(window.location.host);
        if (!isAbsoluteApiBase && isStaticWebAppsHost) {
          const fallbackUrl = environment === 'production'
            ? 'https://agsm-huur-production-api.azurewebsites.net'
            : 'https://agsm-back.azurewebsites.net';
          setActualHuurApiUrl(fallbackUrl);
          console.log('🔗 Running on SWA without absolute API base; using fallback Huur API URL:', fallbackUrl);
          return;
        }

        lastFetchTimeRef.current = now;
        const response = await api.get('/huur-api-config', {
          headers: {
            'x-environment': environment
          },
          timeout: 10000 // 10 second timeout
        });
        setActualHuurApiUrl(response.data.currentHuurApiUrl);
        console.log('🔗 Fetched actual Huur API URL:', response.data.currentHuurApiUrl);
      } catch (error: any) {
        // Avoid noisy console errors in production; fall back gracefully
        console.log('Failed to fetch Huur API config, using fallback URL');
        
        // Handle rate limiting specifically
        if (error.response?.status === 429) {
          console.log('🚫 Rate limited - using fallback URL');
        }
        
        // Set a fallback URL instead of error message
        const fallbackUrl = environment === 'production' 
          ? 'https://agsm-huur-production-api.azurewebsites.net'
          : 'https://agsm-back.azurewebsites.net';
        setActualHuurApiUrl(fallbackUrl);
        console.log('🔗 Using fallback Huur API URL:', fallbackUrl);
      }
    }, 1000); // 1 second debounce
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, baseUrl, updateApiBaseUrl, setActualHuurApiUrl, isAbsoluteApiBase]);

  // Update API when environment changes and save to localStorage
  useEffect(() => {
    // Save environment selection to localStorage for persistence
    localStorage.setItem('huur-environment', environment);
    console.log('🌍 Environment changed to:', environment);
    console.log('🔗 API Base URL (always):', baseUrl);
    updateApiBaseUrl(baseUrl);
    
    // Fetch actual Huur API URL after updating base URL (with debouncing)
    fetchActualHuurApiUrl();
  }, [environment, baseUrl, fetchActualHuurApiUrl]);

  // Fetch Huur API URL on initial load (only once)
  useEffect(() => {
    fetchActualHuurApiUrl(true); // Force initial fetch
  }, [fetchActualHuurApiUrl]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const handleSetEnvironment = async (env: Environment, logout?: () => void) => {
    setEnvironment(env);
    
    // Clear authentication when switching environments (requires re-login)
    // Clear local storage first
    localStorage.removeItem('token');
    
    try {
      // Try to clear the session on the server, but don't fail if it doesn't work
      await authApi.clearSession();
    } catch (error) {
      console.log('Could not clear server session (server may be unreachable):', error);
      // Continue with local cleanup even if server call fails
    }
    
    // Always redirect to login after environment switch
    window.location.href = '/login';
  };

  return (
    <EnvironmentContext.Provider value={{
      environment,
      setEnvironment: handleSetEnvironment,
      baseUrl,
      huurApiUrl: actualHuurApiUrl
    }}>
      {children}
    </EnvironmentContext.Provider>
  );
};

export const useEnvironment = (): EnvironmentContextType => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};
