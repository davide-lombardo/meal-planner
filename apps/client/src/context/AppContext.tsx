import React, { createContext, useContext, useState, useCallback } from 'react';
import { Recipe, Config } from 'shared/schemas';
import { useRecipes } from '../hooks/useRecipes';
import { useFetchData } from '../hooks/useFetchData';
import { CONFIG } from '../utils/constants';

// Define context types
interface AppContextType {
  // Recipes state
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  fetchRecipes: (forceRefresh?: boolean) => Promise<void>;
  
  // Config state
  config: Config | null;
  configLoading: boolean;
  configError: string | null;
  fetchConfig: () => void;
  
  // UI state
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  notification: {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  };
  clearNotification: () => void;
}

// Create context with default values
const AppContext = createContext<AppContextType>({
  recipes: [],
  loading: false,
  error: null,
  fetchRecipes: async () => {},
  
  config: null,
  configLoading: false,
  configError: null,
  fetchConfig: () => {},
  
  showNotification: () => {},
  notification: {
    message: '',
    type: 'info',
    visible: false,
  },
  clearNotification: () => {},
});

// Create provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  // Use our custom hooks for data fetching
  const { 
    recipes, 
    loading, 
    error, 
    fetchRecipes 
  } = useRecipes();
  
  const { 
    data: config, 
    loading: configLoading, 
    error: configError, 
    refetch: fetchConfig 
  } = useFetchData<Config>(`${CONFIG.API_BASE_URL}/config`);
  
  // Notification state
  const [notification, setNotification] = useState({
    message: '',
    type: 'info' as 'success' | 'error' | 'info',
    visible: false,
  });
  
  // Notification handlers
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({
      message,
      type,
      visible: true,
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        visible: false,
      }));
    }, 5000);
  }, []);
  
  const clearNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);
  
  // Combine all values for the context
  const contextValue = {
    recipes,
    loading,
    error,
    fetchRecipes,
    
    config,
    configLoading,
    configError,
    fetchConfig,
    
    showNotification,
    notification,
    clearNotification,
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the AppContext
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
