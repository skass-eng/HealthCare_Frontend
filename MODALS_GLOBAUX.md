# Modals Globaux - Système Unifié

## Vue d'ensemble

Les modals d'export et de création de plaintes sont maintenant **globaux** et accessibles depuis n'importe quelle page de l'application. Ils ne sont plus liés à une page spécifique.

## Architecture

### Store Zustand

Les modals globaux sont gérés via le store Zustand avec ces propriétés :

```typescript
// Dans le store
ui: {
  panels: {
    exportModal: {
      isOpen: boolean
    },
    plainteModal: {
      isOpen: boolean
    }
  }
}

// Actions disponibles
actions: {
  openExportModal: () => void
  closeExportModal: () => void
  openPlainteModal: () => void
  closePlainteModal: () => void
}
```

### Composant GlobalModalsExtended

Le composant `GlobalModalsExtended` gère l'affichage de tous les modals globaux :

- ✅ **Modal d'export** (`ExportModal`)
- ✅ **Modal de création de plainte** (`SimplePlaintePanel`)
- ✅ **Modal de sélection de service** (`ServiceSelectorModal`)

## Utilisation

### 1. Depuis n'importe quel composant

```tsx
import { useAppStore } from '@/store'

export default function MonComposant() {
  const { actions } = useAppStore()

  const ouvrirExport = () => {
    actions.openExportModal()
  }

  const ouvrirNouvellePlainte = () => {
    actions.openPlainteModal()
  }

  return (
    <div>
      <button onClick={ouvrirExport}>Exporter</button>
      <button onClick={ouvrirNouvellePlainte}>Nouvelle plainte</button>
    </div>
  )
}
```

### 2. Depuis les boutons existants

Les boutons existants utilisent maintenant automatiquement les modals globaux :

- **Dashboard Header** : Boutons "Exporter" et "Nouvelle plainte"
- **Dashboard Navigation Bar** : Boutons d'export et de création
- **Dashboard Unifié** : Boutons d'export et de création

## Avantages

### ✅ **Cohérence**
- Même comportement sur toutes les pages
- Même style et fonctionnalités
- Même gestion des erreurs et succès

### ✅ **Maintenabilité**
- Un seul endroit pour modifier les modals
- Pas de duplication de code
- Gestion centralisée des états

### ✅ **Flexibilité**
- Accessibles depuis n'importe où
- Pas de limitation par la page parente
- Contrôle via le store global

### ✅ **Performance**
- Chargement unique des composants
- Pas de re-création à chaque page
- État persistant entre les navigations

## Fonctionnalités

### Modal d'Export
- ✅ Export CSV avec encodage UTF-8
- ✅ Export JSON
- ✅ Filtres par statut, service, dates
- ✅ Téléchargement automatique
- ✅ Notifications de succès/erreur

### Modal de Création de Plainte
- ✅ Formulaire complet
- ✅ Upload PDF
- ✅ Validation des données
- ✅ Création via API
- ✅ Mise à jour automatique des statistiques
- ✅ Notifications de succès/erreur

## Intégration

### Layout Principal
```tsx
// Dans app/layout.tsx
<StoreProvider>
  <div className="dashboard">
    {/* Contenu de l'application */}
  </div>
  <GlobalModalsExtended />  {/* Modals globaux */}
</StoreProvider>
```

### Composants Modifiés
- ✅ `DashboardHeader` : Utilise les modals globaux
- ✅ `DashboardNavigationBar` : Utilise les modals globaux
- ✅ `DashboardUnifiedPage` : Utilise les modals globaux

## Migration

### Avant
```tsx
// Modal local dans chaque page
const [showModal, setShowModal] = useState(false)

<button onClick={() => setShowModal(true)}>
  Ouvrir modal
</button>

{showModal && <MonModal onClose={() => setShowModal(false)} />}
```

### Après
```tsx
// Modal global accessible partout
const { actions } = useAppStore()

<button onClick={() => actions.openExportModal()}>
  Exporter
</button>

// Le modal est géré automatiquement par GlobalModalsExtended
```

## Résultat

🎯 **Les modals d'export et de création de plaintes sont maintenant globaux et accessibles depuis n'importe quelle page de l'application !** 