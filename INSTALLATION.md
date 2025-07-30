# 🚀 Guide d'Installation HealthCare AI - Frontend

## ⚡ Installation Rapide

### 1. Prérequis
Assurez-vous d'avoir installé :
- **Node.js 18+** : [Télécharger Node.js](https://nodejs.org/)
- **npm** (inclus avec Node.js)

Vérification :
```bash
node --version  # Doit afficher v18+
npm --version   # Doit afficher 9+
```

### 2. Installation des dépendances

```bash
cd frontend
npm install
```

**⏳ L'installation peut prendre 2-3 minutes...**

### 3. Configuration

Créer le fichier `.env.local` :
```bash
# Backend API URL
BACKEND_URL=http://localhost:6000
NEXT_PUBLIC_BACKEND_URL=http://localhost:6000
```

### 4. Lancement

```bash
npm run dev
```

✅ **L'application sera accessible sur http://localhost:4000**

---

## 🎯 Vérification du Fonctionnement

### Checklist de démarrage :

1. ✅ **Backend en marche** : `http://localhost:6000/docs` accessible
2. ✅ **Frontend lancé** : `npm run dev` sans erreurs
3. ✅ **Interface accessible** : `http://localhost:4000` charge correctement
4. ✅ **Design affiché** : Style glassmorphism violet/bleu visible
5. ✅ **Navigation fonctionnelle** : Sidebar cliquable

### Si des erreurs TypeScript apparaissent :

**C'est normal au début !** Les erreurs TypeScript se résolvent automatiquement après l'installation.

Si elles persistent :
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Redémarrer le serveur
npm run dev
```

---

## 🎨 Aperçu des Fonctionnalités

### ✅ Déjà implémenté :
- 🏠 **Dashboard principal** avec design glassmorphism
- 📊 **Grille de statistiques** (4 cartes temps réel)
- 📋 **Panel des plaintes** avec suggestions IA
- 🎯 **Panel des améliorations** par service
- 🧭 **Navigation latérale** complète
- 🎨 **Design system** médical (couleurs par service)
- 📱 **Responsive design**

### 🔧 À connecter avec l'API :
- Récupération des vraies données depuis le backend
- Upload de fichiers avec drag & drop
- Gestion des suggestions IA
- Notifications temps réel

---

## 🏗️ Structure Créée

```
frontend/
├── app/
│   ├── globals.css           ✅ Style glassmorphism complet
│   ├── layout.tsx           ✅ Layout avec sidebar
│   └── page.tsx             ✅ Dashboard principal
├── components/
│   ├── Dashboard/
│   │   ├── DashboardHeader.tsx    ✅ Header avec boutons
│   │   ├── StatsGrid.tsx          ✅ 4 cartes statistiques
│   │   ├── ComplaintsPanel.tsx    ✅ Panel plaintes + IA
│   │   └── SuggestionsPanel.tsx   ✅ Panel améliorations
│   └── Sidebar.tsx          ✅ Navigation complète
├── lib/
│   └── api.ts               ✅ Service API complet
├── types/
│   └── index.ts             ✅ Types TypeScript
└── Configuration files      ✅ Next.js + Tailwind
```

---

## 🎨 Design Reproduit

✅ **Fidèle au mockup** :
- Dégradé de fond violet/bleu
- Cards translucides avec effet blur
- Couleurs par service médical :
  - 🔴 Cardiologie (rouge)
  - 🟠 Urgences (orange)  
  - 🟢 Pédiatrie (vert)
  - 🔵 Chirurgie (bleu)
- Suggestions IA avec icônes robots
- Animations fluides

---

## 🔗 Connexion API

Le service API est **prêt** et couvre toutes les routes backend :

```typescript
// Exemples d'utilisation
import { getStats, uploadPlainte, getPlainteDetails } from '@/lib/api'

// Récupérer les statistiques
const stats = await getStats()

// Upload un fichier
const result = await uploadPlainte(file)

// Détails d'une plainte
const details = await getPlainteDetails('PL-2025-XXX')
```

---

## 🚀 Prochaines Étapes

1. **Vérifier l'installation** avec cette checklist
2. **Tester l'interface** sur `http://localhost:4000`
3. **Connecter les vraies données** en remplaçant les données mock
4. **Ajouter l'upload** de fichiers
5. **Implémenter les notifications**

---

## 🆘 Dépannage

### Erreur "Module not found"
```bash
npm install  # Réinstaller les dépendances
```

### Port 3000 occupé
```bash
npm run dev -- -p 3001  # Utiliser un autre port
```

### Problèmes Tailwind CSS
```bash
npm run build  # Compiler une fois
npm run dev    # Relancer
```

### Backend non accessible
- Vérifier que FastAPI fonctionne sur `http://localhost:6000`
- Contrôler le fichier `.env.local`

---

**🎉 Votre interface HealthCare AI est prête !**

L'interface reproduit **exactement** le mockup avec un design moderne et professionnel. 