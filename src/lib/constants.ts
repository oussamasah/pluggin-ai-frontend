// lib/constants.ts
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  };
  
  // Environment validation
  if (typeof window !== 'undefined') {
    if (!API_CONFIG.BASE_URL) {
      console.warn('NEXT_PUBLIC_API_URL is not set, using default');
    }
  }