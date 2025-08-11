# Explorer Frontend - ODYSSEE

Frontend React moderne pour l'application ODYSSEE d'analyse de données scientifiques.

## 🚀 Technologies

- **React 18** avec TypeScript
- **Redux Toolkit** pour la gestion d'état
- **Material-UI (MUI)** pour l'interface utilisateur
- **React Router** pour la navigation
- **Axios** pour les requêtes HTTP
- **Socket.io-client** pour les WebSockets
- **Vite** pour le build et le développement

## 🎨 Design

Inspiré du design HealthCare avec :
- Dégradés bleu-violet modernes
- Effets de verre (glassmorphism)
- Animations fluides
- Interface responsive
- Typographie Inter

## 📁 Structure

```
src/
├── components/          # Composants réutilisables
│   └── Sidebar.tsx     # Barre de navigation
├── lib/                # Services et utilitaires
│   ├── api.ts         # Service API avec Axios
│   └── websocket.ts   # Service WebSocket
├── pages/              # Pages de l'application
│   ├── Dashboard.tsx   # Tableau de bord principal
│   ├── Login.tsx       # Page de connexion
│   ├── Register.tsx    # Page d'inscription
│   └── ...            # Autres pages
├── store/              # Configuration Redux
│   ├── index.ts        # Store principal
│   └── slices/         # Slices Redux
│       ├── authSlice.ts
│       ├── dashboardSlice.ts
│       ├── taskSlice.ts
│       └── ...
├── styles/             # Styles globaux
│   └── globals.css     # CSS personnalisé
├── types/              # Types TypeScript
│   └── index.ts        # Interfaces et types
├── App.tsx             # Composant principal
└── main.tsx           # Point d'entrée
```

## 🛠️ Installation

1. **Installer les dépendances**
```bash
npm install
```

2. **Configurer les variables d'environnement**
Créer un fichier `.env` :
```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=http://localhost:8000
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔧 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualise le build
- `npm run lint` - Linting du code
- `npm run type-check` - Vérification TypeScript

## 🌐 Fonctionnalités

### Authentification
- Connexion/inscription utilisateur
- Gestion des tokens JWT
- Protection des routes

### Dashboard
- Vue d'ensemble des projets
- Statistiques en temps réel
- Tâches récentes
- Actions rapides

### Navigation
- Sidebar responsive
- Navigation par onglets
- Badges de notifications
- Actions rapides

### WebSockets
- Communication temps réel
- Mises à jour de tâches
- Notifications push
- Gestion des connexions

### Redux Store
- Gestion d'état centralisée
- Slices modulaires
- Actions asynchrones
- Persistance locale

## 🎯 Architecture

### Communication API
- Service Axios configuré
- Intercepteurs pour l'authentification
- Gestion d'erreurs centralisée
- Types TypeScript stricts

### WebSocket
- Connexion automatique
- Reconnexion intelligente
- Événements typés
- Gestion des erreurs

### UI/UX
- Design system cohérent
- Composants réutilisables
- Responsive design
- Animations fluides

## 🔐 Sécurité

- Authentification JWT
- Protection des routes
- Validation des données
- Gestion des erreurs

## 📱 Responsive

- Mobile-first design
- Breakpoints Material-UI
- Navigation adaptative
- Composants flexibles

## 🚀 Déploiement

1. **Build de production**
```bash
npm run build
```

2. **Déployer le dossier `dist/`**
- Vercel
- Netlify
- Serveur statique

## 🔧 Configuration

### Variables d'environnement
- `VITE_API_URL` - URL de l'API backend
- `VITE_WS_URL` - URL des WebSockets

### Thème Material-UI
- Palette de couleurs personnalisée
- Typographie Inter
- Composants stylisés
- Effets de verre

## 📊 Performance

- Code splitting automatique
- Lazy loading des composants
- Optimisation des images
- Bundle analysis

## 🧪 Tests

```bash
# Tests unitaires (à implémenter)
npm run test

# Tests E2E (à implémenter)
npm run test:e2e
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation
- Contacter l'équipe de développement

---

**ODYSSEE** - Analyse de données scientifiques avec interface moderne et intuitive. 