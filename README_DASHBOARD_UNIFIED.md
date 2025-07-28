# Dashboard Unifié Frontend - HealthCare AI

## 🎯 Vue d'ensemble

Le frontend du Dashboard Unifié offre une interface moderne et intuitive pour gérer les plaintes avec des filtres avancés. Il s'intègre parfaitement avec l'API backend unifiée.

## 📁 Structure des Fichiers

### Pages
```
frontend/app/dashboard-unified/
└── page.tsx                    # Page principale du dashboard unifié
```

### Composants
```
frontend/components/Dashboard/
├── DashboardUnifiedHeader.tsx   # Header avec navigation par onglets
├── DashboardUnifiedFilters.tsx  # Système de filtres avancés
├── DashboardUnifiedStats.tsx    # Affichage des statistiques
├── DashboardUnifiedPlaintes.tsx # Liste des plaintes avec filtres
└── DashboardUnifiedCharts.tsx   # Graphiques et répartitions
```

## 🚀 Fonctionnalités

### 📊 Interface Principale
- **Header moderne** : Navigation intuitive entre statistiques et plaintes
- **Filtres avancés** : Système de filtres en temps réel
- **Statistiques en temps réel** : KPIs avec progression
- **Liste des plaintes** : Affichage paginé avec filtres

### 🎛️ Système de Filtres
- **Type de service** : URGENCES, CARDIOLOGIE, PEDIATRIE, etc.
- **Catégorie principale** : Classification des plaintes
- **Sous-catégorie** : Détail de la classification
- **Priorité** : URGENT, ELEVE, MOYEN, BAS
- **Statut** : NOUVELLE, EN_COURS, TRAITEE, etc.
- **Organisation** : Sélection de l'organisation

### 📈 Statistiques
- **KPIs principaux** : Nouvelles, en attente, en retard, en cours, traitées
- **Progression** : Comparaison avec la période précédente
- **Alertes** : Détection automatique des situations critiques
- **Graphiques** : Répartitions par service et priorité

### 📋 Gestion des Plaintes
- **Onglets** : En cours, en attente, traitées, urgentes
- **Pagination** : Navigation dans les résultats
- **Filtres actifs** : Affichage des filtres appliqués
- **Détails** : Informations complètes sur chaque plainte

## 🎨 Design et UX

### Interface Moderne
- **Design responsive** : Adaptation mobile et desktop
- **Animations fluides** : Transitions et chargements
- **Couleurs cohérentes** : Palette de couleurs unifiée
- **Icônes intuitives** : Navigation claire

### Expérience Utilisateur
- **Chargement progressif** : Skeleton loading
- **Feedback visuel** : États de chargement et erreurs
- **Navigation intuitive** : Onglets et filtres clairs
- **Accessibilité** : Support des lecteurs d'écran

## 🔧 Configuration

### Variables d'Environnement
```bash
# Configuration API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DASHBOARD_ENDPOINT=/api/v1/dashboard

# Configuration des filtres
NEXT_PUBLIC_DEFAULT_ORGANISATION_ID=1
NEXT_PUBLIC_DEFAULT_PAGE_SIZE=20
```

### Types TypeScript
```typescript
interface DashboardFilters {
  type_service: string
  categorie_principale: string
  sous_categorie: string
  priorite: string
  statut: string
  organisation_id: number
}

interface DashboardStats {
  nouvelles_plaintes: number
  plaintes_en_attente: number
  plaintes_en_retard: number
  en_cours_traitement: number
  traitees_ce_mois: number
  satisfaction_moyenne: number
  progression: Record<string, string>
  statistiques_detaillees: any
  repartitions: any
  alertes: Record<string, boolean>
}
```

## 📱 Utilisation

### Navigation
1. **Accès** : Cliquer sur "Dashboard Unifié" dans la sidebar
2. **Onglets** : Basculer entre "Statistiques" et "Plaintes"
3. **Filtres** : Utiliser les filtres pour affiner les résultats

### Filtres
1. **Sélection** : Choisir les critères dans les menus déroulants
2. **Application** : Les filtres s'appliquent automatiquement
3. **Réinitialisation** : Bouton "Réinitialiser" pour tout effacer
4. **Filtres actifs** : Affichage des filtres appliqués

### Plaintes
1. **Types** : Sélectionner le type de plaintes (en cours, en attente, etc.)
2. **Pagination** : Navigation entre les pages
3. **Détails** : Cliquer sur "Voir détails" pour plus d'informations

## 🔄 Intégration API

### Endpoints Utilisés
```typescript
// Statistiques avec filtres
GET /api/v1/dashboard/statistiques

// Filtres disponibles
GET /api/v1/dashboard/filtres-disponibles

// Plaintes avec filtres
GET /api/v1/dashboard/plaintes/en-cours
GET /api/v1/dashboard/plaintes/en-attente
GET /api/v1/dashboard/plaintes/traitees
GET /api/v1/dashboard/plaintes/urgentes
```

### Gestion des Erreurs
- **Erreurs réseau** : Affichage d'alertes utilisateur
- **Données manquantes** : États de chargement appropriés
- **Filtres invalides** : Validation côté client

## 🎯 Composants Détaillés

### DashboardUnifiedHeader
- **Navigation par onglets** : Statistiques et Plaintes
- **Informations de service** : Affichage du service sélectionné
- **Design responsive** : Adaptation mobile

### DashboardUnifiedFilters
- **Filtres dynamiques** : Chargement depuis l'API
- **Filtres actifs** : Affichage des filtres appliqués
- **Réinitialisation** : Bouton pour effacer tous les filtres

### DashboardUnifiedStats
- **KPIs visuels** : Cartes avec icônes et couleurs
- **Progression** : Indicateurs de tendance
- **Alertes** : Notifications des situations critiques

### DashboardUnifiedPlaintes
- **Liste paginée** : Affichage des plaintes
- **Filtres par type** : Onglets pour différents statuts
- **Informations détaillées** : Métadonnées des plaintes

### DashboardUnifiedCharts
- **Répartitions** : Graphiques par service et priorité
- **Statistiques détaillées** : Métriques avancées
- **Performance IA** : Indicateurs d'efficacité

## 🚀 Démarrage

### Installation
```bash
cd frontend
npm install
```

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Accès
- **URL** : http://localhost:3000/dashboard-unified
- **Navigation** : Via la sidebar "Dashboard Unifié"

## 🔧 Personnalisation

### Thèmes
```css
/* Variables CSS personnalisables */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

### Composants
- **Extensibles** : Structure modulaire
- **Réutilisables** : Composants indépendants
- **Configurables** : Props personnalisables

## 📊 Métriques de Performance

### Optimisations
- **Lazy loading** : Chargement à la demande
- **Memoization** : Cache des composants
- **Debouncing** : Optimisation des filtres
- **Pagination** : Chargement progressif

### Monitoring
- **Temps de chargement** : < 2 secondes
- **Responsivité** : Support mobile/desktop
- **Accessibilité** : Score WCAG AA

## 🔄 Évolutions Futures

### Fonctionnalités Prévues
- **Export PDF** : Génération de rapports
- **Notifications** : Alertes en temps réel
- **Graphiques avancés** : Visualisations interactives
- **Mode sombre** : Thème alternatif

### Améliorations
- **Performance** : Optimisation continue
- **UX** : Amélioration de l'expérience utilisateur
- **Accessibilité** : Support étendu
- **Internationalisation** : Multi-langues

---

**HealthCare AI - Dashboard Unifié Frontend v1.0.0**
*Interface moderne et intuitive pour la gestion des plaintes médicales* 