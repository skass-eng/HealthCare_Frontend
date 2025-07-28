# 🏥 HealthCare AI - Frontend

Interface moderne de gestion des plaintes médicales alimentée par IA.

## 🚀 Installation

### Prérequis
- **Node.js** 18+ et **npm** 
- Backend FastAPI en cours d'exécution sur `http://localhost:8000`

### 1. Installation des dépendances

```bash
cd frontend
npm install
```

### 2. Configuration

Créer un fichier `.env.local` :

```bash
# Backend API URL
BACKEND_URL=http://localhost:8000

# Next.js Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### 3. Lancement en développement

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## 🎨 Stack Technique

- **Framework** : Next.js 14 + TypeScript
- **Styling** : Tailwind CSS + Design System personnalisé
- **Composants** : Headless UI + Heroicons
- **Animations** : Framer Motion
- **API** : Axios pour les appels backend
- **Charts** : Chart.js + React Chart.js 2

## 📱 Design

- **Style** : Glassmorphism moderne
- **Responsive** : Mobile-first design
- **Accessibilité** : WCAG 2.1 compatible
- **Performance** : Optimisé avec Next.js

## 🗂️ Structure du projet

```
frontend/
├── app/                    # App Router Next.js 13+
│   ├── globals.css        # Styles globaux + Design System
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page dashboard
├── components/            # Composants réutilisables
│   ├── Dashboard/         # Composants du dashboard
│   └── Sidebar.tsx        # Navigation latérale
├── lib/                   # Utilitaires et services
│   └── api.ts            # Service API
├── types/                 # Types TypeScript
│   └── index.ts          # Types de l'application
└── public/               # Assets statiques
```

## 🔗 API Routes

Le frontend communique avec le backend FastAPI via :

- **Dashboard** : `GET /stats` - Statistiques
- **Plaintes** : `GET /plaintes` - Liste des plaintes
- **Upload** : `POST /upload-plainte` - Téléchargement
- **Détails** : `GET /plainte/{id}/details` - Détail plainte
- **Suggestions** : `GET /plainte/{id}/suggestions` - Suggestions IA

## 🎯 Fonctionnalités implémentées

### ✅ Dashboard
- [x] Grille de statistiques en temps réel
- [x] Panel des plaintes prioritaires
- [x] Suggestions IA par service
- [x] Navigation intuitive

### ✅ Design System
- [x] Style glassmorphism
- [x] Couleurs par service médical
- [x] Animations fluides
- [x] Responsive design

### 🚧 À implémenter
- [ ] Gestion des plaintes (CRUD)
- [ ] Upload de fichiers
- [ ] Système de notifications
- [ ] Analytics avancées
- [ ] Gestion des utilisateurs

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Lancement production
npm run start

# Linting
npm run lint

# Vérification TypeScript
npm run type-check
```

## 🎨 Personnalisation

### Couleurs des services
```css
/* globals.css */
.service-cardiologie { @apply bg-red-500; }
.service-urgences { @apply bg-orange-500; }
.service-pediatrie { @apply bg-green-500; }
.service-chirurgie { @apply bg-blue-500; }
```

### Thème glassmorphism
```css
.glass-card {
  @apply bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl;
}
```

## 🔧 Dépannage

### Erreurs TypeScript
- Vérifier que toutes les dépendances sont installées : `npm install`
- Redémarrer le serveur de développement : `Ctrl+C` puis `npm run dev`

### Problèmes de connexion API
- Vérifier que le backend FastAPI fonctionne sur `http://localhost:8000`
- Contrôler la configuration CORS du backend
- Vérifier le fichier `.env.local`

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs de la console navigateur
2. Contrôler les logs du serveur Next.js
3. Valider la connexion avec le backend

---

**🎉 Profitez de votre interface HealthCare AI moderne !** 