# Écouteurs d'Événements Passifs - Bonnes Pratiques

## Problème

Les navigateurs modernes affichent un avertissement quand des écouteurs d'événements non-passifs sont utilisés :

```
[Violation] Added non-passive event listener to a scroll-blocking <some> event. 
Consider marking event handler as 'passive' to make the page more responsive.
```

## Solution

### 1. Utiliser l'option `passive: true`

Pour tous les écouteurs d'événements qui ne nécessitent pas `preventDefault()`, utilisez l'option `passive: true` :

```typescript
// ❌ Incorrect
document.addEventListener('mousedown', handleClickOutside)

// ✅ Correct
document.addEventListener('mousedown', handleClickOutside, { passive: true })
```

### 2. Hook personnalisé

Utilisez le hook `usePassiveEventListener` pour une gestion cohérente :

```typescript
import { usePassiveEventListener, useClickOutside, useKeyDown } from '@/hooks/usePassiveEventListener'

// Pour les clics en dehors d'un élément
useClickOutside(modalRef, () => {
  onClose()
})

// Pour les touches clavier
useKeyDown('Escape', () => {
  onClose()
})
```

### 3. Événements concernés

Les événements suivants doivent être passifs quand possible :
- `mousedown`
- `mouseup`
- `click`
- `touchstart`
- `touchmove`
- `touchend`
- `wheel`
- `scroll`

### 4. Exceptions

Ne pas utiliser `passive: true` si vous avez besoin de :
- `preventDefault()`
- `stopPropagation()`
- Modifier le comportement par défaut du navigateur

### 5. Vérification

Pour vérifier que tous les écouteurs sont passifs, utilisez :

```bash
grep -r "addEventListener" src/ --include="*.tsx" --include="*.ts"
```

## Exemples d'implémentation

### Modal avec fermeture par clic extérieur

```typescript
import { useClickOutside } from '@/hooks/usePassiveEventListener'

export function Modal({ onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null)
  
  useClickOutside(modalRef, onClose)
  
  return (
    <div ref={modalRef}>
      {children}
    </div>
  )
}
```

### Gestion des touches clavier

```typescript
import { useKeyDown } from '@/hooks/usePassiveEventListener'

export function KeyboardHandler() {
  useKeyDown('Escape', () => {
    console.log('Escape pressed')
  })
  
  useKeyDown('Enter', () => {
    console.log('Enter pressed')
  })
}
```

## Avantages

1. **Performance améliorée** : Le navigateur peut optimiser le rendu
2. **Responsivité** : Moins de blocage du thread principal
3. **Conformité** : Respect des standards web modernes
4. **Maintenabilité** : Code plus propre et cohérent

## Notes importantes

- Les bibliothèques tierces (Plotly.js, etc.) gèrent leurs propres optimisations
- Les événements dans les fichiers `.next/` sont générés automatiquement
- Toujours tester après modification pour s'assurer que la fonctionnalité reste intacte 