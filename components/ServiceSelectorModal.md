# ServiceSelectorModal - Modal Global de Sélection de Service

## Description

Le `ServiceSelectorModal` est un composant modal global qui permet de sélectionner un service pour l'analyse IA. Il peut être utilisé n'importe où dans l'application et n'est pas limité par la taille de sa fenêtre parente.

## Avantages

- **Flexibilité** : Peut être positionné n'importe où dans l'application
- **Pas de limitation de taille** : Utilise `fixed` positioning avec `z-index` élevé
- **Contrôle via Store** : Utilise Zustand pour la gestion d'état globale
- **Réutilisable** : Peut être utilisé depuis n'importe quel composant
- **Personnalisable** : Props pour personnaliser le titre, description, boutons, etc.

## Utilisation

### 1. Depuis n'importe quel composant

```tsx
import { useAppStore } from '@/hooks/useAppStore'

export default function MonComposant() {
  const { actions } = useAppStore()

  const ouvrirModalService = () => {
    actions.setShowGlobalServiceSelector(true)
  }

  return (
    <button onClick={ouvrirModalService}>
      Ouvrir sélection de service
    </button>
  )
}
```

### 2. Props disponibles

```tsx
interface ServiceSelectorModalProps {
  isOpen: boolean                    // Contrôle l'affichage du modal
  onClose: () => void               // Fonction appelée à la fermeture
  onServiceSelect?: (service: string) => void  // Callback personnalisé pour la sélection
  onProcessAll?: () => void         // Callback personnalisé pour "Traiter tout"
  title?: string                    // Titre personnalisé
  description?: string              // Description personnalisée
  showProcessAllButton?: boolean    // Afficher le bouton "Traiter tout"
  showCancelButton?: boolean        // Afficher le bouton "Annuler"
  cancelButtonText?: string         // Texte du bouton Annuler
  processAllButtonText?: string     // Texte du bouton Traiter tout
}
```

### 3. Exemple d'utilisation personnalisée

```tsx
import ServiceSelectorModal from '@/components/ServiceSelectorModal'

export default function MonComposantPersonnalise() {
  const [isOpen, setIsOpen] = useState(false)

  const handleServiceSelect = (service: string) => {
    console.log(`Service sélectionné: ${service}`)
    // Logique personnalisée ici
    setIsOpen(false)
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Sélectionner un service
      </button>
      
      <ServiceSelectorModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onServiceSelect={handleServiceSelect}
        title="Choisir un service médical"
        description="Sélectionnez le service pour votre analyse :"
        showProcessAllButton={false}
        cancelButtonText="Fermer"
      />
    </>
  )
}
```

## Architecture

### Store Zustand

Le modal utilise le store global avec ces propriétés :

```tsx
// Dans le store
ui: {
  showGlobalServiceSelector: boolean  // Contrôle l'affichage du modal global
}

// Actions disponibles
actions: {
  setShowGlobalServiceSelector: (show: boolean) => void
}
```

### Composant GlobalModals

Le composant `GlobalModals` est inclus dans le layout principal et gère l'affichage du modal :

```tsx
// Dans app/layout.tsx
<StoreProvider>
  <div className="dashboard">
    {/* Contenu de l'application */}
  </div>
  <GlobalModals />  {/* Modals globaux */}
</StoreProvider>
```

## Services disponibles

Le modal affiche automatiquement ces services :

- Cardiologie
- Urgences
- Pédiatrie
- Chirurgie
- Radiologie
- Oncologie
- Neurologie
- Orthopédie

## Styles

Le modal utilise :
- `fixed inset-0` pour couvrir tout l'écran
- `z-50` pour être au-dessus de tout
- `backdrop-blur-sm` pour l'effet de flou
- `glass-card` pour le style glassmorphism
- Responsive design avec `max-w-4xl` et `max-h-[90vh]`

## Intégration avec l'IA

Le modal s'intègre automatiquement avec :
- Les actions du store (`processService`, `processAllFiles`)
- L'état de chargement (`loading.processing`)
- Les données de suggestions existantes
- Les indicateurs visuels de progression 