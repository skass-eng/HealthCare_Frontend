import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary classique : capture les erreurs de rendu des composants enfants
 * et affiche un fallback propre au lieu d'un écran blanc.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Met à jour l'état pour afficher le fallback au prochain rendu
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Journalisation de l'erreur pour le débogage
    console.error('💥 ErrorBoundary a capturé une erreur de rendu:', error, errorInfo);
  }

  handleBackToDashboard = (): void => {
    window.location.href = '/dashboard-unified';
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            padding: '32px',
            textAlign: 'center',
            backgroundColor: '#f5f5f7',
            color: '#1d1d1f',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }} aria-hidden="true">
            ⚠️
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 0 12px 0',
              color: '#1d1d1f',
              letterSpacing: '-0.02em',
            }}
          >
            Une erreur est survenue
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#86868b',
              margin: '0 0 24px 0',
              maxWidth: '420px',
              lineHeight: 1.5,
            }}
          >
            Un problème inattendu a empêché l'affichage de cette page. Vous pouvez
            revenir au tableau de bord pour continuer.
          </p>
          <button
            type="button"
            onClick={this.handleBackToDashboard}
            style={{
              backgroundColor: '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Retour au tableau de bord
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
