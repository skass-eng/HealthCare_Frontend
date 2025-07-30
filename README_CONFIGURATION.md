# 🔧 Configuration Centralisée des URLs API

## 📋 Vue d'ensemble

Ce projet utilise maintenant une configuration centralisée pour toutes les URLs API, évitant ainsi de coder en dur les URLs dans chaque fichier.

## 🎯 Avantages

- ✅ **Un seul endroit pour changer les URLs** : Modifiez le fichier `.env.local`
- ✅ **Configuration par environnement** : Différentes URLs pour dev, staging, prod
- ✅ **Gestion d'erreur centralisée** : Toutes les erreurs API sont gérées uniformément
- ✅ **Type safety** : Configuration TypeScript avec autocomplétion

## 📁 Structure des fichiers

### `.env.local` (Configuration principale)
```bash
# Configuration Backend
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# Configuration Frontend
NEXT_PUBLIC_FRONTEND_URL=http://localhost:4000

# Configuration API
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

### `lib/api-config.ts` (Configuration centralisée)
```typescript
export const API_CONFIG = {
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:4000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
  
  ENDPOINTS: {
    STATISTIQUES: '/api/v1/dashboard/statistiques',
    FILTRES_DISPONIBLES: '/api/v1/dashboard/filtres-disponibles',
    // ... autres endpoints
  }
}
```

## 🚀 Comment utiliser

### 1. Dans les composants React
```typescript
import { buildApiUrl, API_CONFIG } from '@/lib/api-config'

// Appel API simple
const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STATISTIQUES))

// Appel API avec paramètres
const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STATISTIQUES, {
  periode: '7j',
  service: 'urgences'
}))
```

### 2. Dans les messages d'erreur
```typescript
import { API_CONFIG } from '@/lib/api-config'

<p>Vérifiez que le backend est en marche sur {API_CONFIG.BACKEND_URL}</p>
```

### 3. Dans les routes API Next.js
```typescript
import { API_CONFIG } from '@/lib/api-config'

const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/v1/dashboard/statistiques`)
```

## 🔄 Changer les ports

### Pour changer le port du backend :
1. Modifiez `BACKEND_URL` dans `.env.local`
2. Modifiez `NEXT_PUBLIC_BACKEND_URL` dans `.env.local`
3. Modifiez `NEXT_PUBLIC_API_BASE_URL` dans `.env.local`
4. Redémarrez le frontend

### Pour changer le port du frontend :
1. Modifiez le script dans `package.json`
2. Modifiez `NEXT_PUBLIC_FRONTEND_URL` dans `.env.local`

## 📝 Exemples de migration

### Avant (❌ Mauvaise pratique)
```typescript
const response = await fetch('http://localhost:5000/api/v1/dashboard/statistiques')
```

### Après (✅ Bonne pratique)
```typescript
import { buildApiUrl, API_CONFIG } from '@/lib/api-config'

const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.STATISTIQUES))
```

## 🛠️ Fonctions utilitaires

### `buildApiUrl(endpoint, params?)`
Construit une URL complète avec paramètres optionnels.

### `apiCall(endpoint, options?, params?)`
Fait un appel API avec gestion d'erreur automatique.

## 🔍 Vérification

Pour vérifier que tout fonctionne :
1. Backend : `curl http://localhost:5000/health`
2. Frontend : `curl http://localhost:4000`
3. Documentation : `curl http://localhost:5000/docs`

## 🚨 Troubleshooting

### Erreur "Cannot find module '@/lib/api-config'"
- Vérifiez que le fichier `lib/api-config.ts` existe
- Vérifiez que l'import utilise le bon chemin

### Erreur "process.env is undefined"
- Vérifiez que les variables d'environnement commencent par `NEXT_PUBLIC_`
- Redémarrez le serveur de développement

### Erreur de connexion au backend
- Vérifiez que le backend est en cours d'exécution
- Vérifiez les URLs dans `.env.local`
- Vérifiez que les ports ne sont pas utilisés par d'autres applications 