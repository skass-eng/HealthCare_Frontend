/**
 * CONTEXTE APP CLIENT - Frontend ODYSSEE Architecture
 * Contexte React pour fournir l'AppClient selon l'architecture ODYSSEE
 * Version: 1.0.0 - Architecture ODYSSEE
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppClient, appClient } from './AppClient';
import { PageKey } from './constants';
import { User } from '../types/api';

interface AppClientContextType {
  appClient: AppClient;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentPage: PageKey | null;
  setCurrentPage: (pageKey: PageKey) => void;
}

const AppClientContext = createContext<AppClientContextType | undefined>(undefined);

interface AppClientProviderProps {
  children: ReactNode;
}

export const AppClientProvider: React.FC<AppClientProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPageState] = useState<PageKey | null>(null);

  // Initialisation et vérification de l'authentification au démarrage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔐 Initialisation de l\'authentification...');
      
      try {
        setIsLoading(true);
        
        // Vérifier si l'utilisateur est déjà authentifié
        const isAuth = appClient.auth.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          // Récupérer les données utilisateur depuis localStorage
          const localUser = appClient.auth.getUserFromLocalStorage();
          if (localUser) {
            setUser(localUser);
            console.log('👤 Utilisateur restauré:', localUser.email);
            
            // Optionnel : vérifier la validité du token avec le serveur
            try {
              const userResponse = await appClient.auth.getCurrentUser();
              if (userResponse.success && userResponse.data) {
                setUser(userResponse.data);
                console.log('✅ Token validé avec le serveur');
              } else {
                // Token invalide, déconnecter
                console.warn('⚠️ Token invalide, déconnexion...');
                handleLogout();
              }
            } catch (error) {
              console.warn('⚠️ Erreur de validation du token:', error);
              // En cas d'erreur réseau, garder l'utilisateur connecté localement
            }
          }
        }
        
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de l\'authentification:', error);
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fonction pour gérer la déconnexion
  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPageState(null);
    appClient.logout();
  };

  // Fonction pour changer de page avec gestion des requêtes
  const setCurrentPage = (pageKey: PageKey) => {
    console.log('📄 Changement de page via contexte:', pageKey);
    setCurrentPageState(pageKey);
    appClient.setCurrentPage(pageKey);
  };

  // Écouter les changements d'authentification
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'odyssee_healthcare_jwt_token' || e.key === 'odyssee_healthcare_user') {
        // Token ou utilisateur modifié dans un autre onglet
        const isAuth = appClient.auth.isAuthenticated();
        const localUser = appClient.auth.getUserFromLocalStorage();
        
        setIsAuthenticated(isAuth);
        setUser(localUser);
        
        if (!isAuth) {
          setCurrentPageState(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Nettoyage automatique lors du démontage
  useEffect(() => {
    return () => {
      console.log('🧹 Nettoyage AppClientProvider');
      if (currentPage) {
        appClient.cancelPageRequests(currentPage);
      }
    };
  }, [currentPage]);

  const contextValue: AppClientContextType = {
    appClient,
    user,
    isAuthenticated,
    isLoading,
    currentPage,
    setCurrentPage,
  };

  return (
    <AppClientContext.Provider value={contextValue}>
      {children}
    </AppClientContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAppClient = (): AppClientContextType => {
  const context = useContext(AppClientContext);
  
  if (!context) {
    throw new Error('useAppClient doit être utilisé dans un AppClientProvider');
  }
  
  return context;
};

// Hook spécialisé pour l'authentification
export const useAuth = () => {
  const { appClient, user, isAuthenticated, isLoading } = useAppClient();
  
  const login = async (email: string, password: string) => {
    const response = await appClient.auth.login(email, password);
    return response;
  };

  const logout = () => {
    appClient.logout();
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    authService: appClient.auth
  };
};

// Hook pour gérer la page courante
export const useCurrentPage = () => {
  const { currentPage, setCurrentPage } = useAppClient();
  
  return {
    currentPage,
    setCurrentPage
  };
};

export default AppClientContext;