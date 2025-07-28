# 📊 Composants Analytics

Ce dossier contient les composants modulaires pour l'analyse des plaintes et des tendances.

## 🏗️ Structure des Composants

### 1. **AnalyticsContent.tsx** - Composant Principal
- **Rôle** : Composant conteneur qui gère la navigation entre les onglets
- **Fonctionnalités** :
  - Gestion des onglets (Vue d'ensemble, Par Service, Tendances, Performance)
  - Chargement des données analytics via API
  - Gestion des données de démonstration
  - Sélecteur de période (7j, 30j, 90j)

### 2. **VueEnsemble.tsx** - Vue d'ensemble
- **Rôle** : Affiche les indicateurs clés et graphiques principaux
- **Contenu** :
  - KPIs principaux (Total Plaintes, Satisfaction, Temps Moyen, Urgentes)
  - Graphique de répartition par priorité
  - Graphique d'évolution temporelle

### 3. **ParService.tsx** - Analyse par Service
- **Rôle** : Analyse détaillée des plaintes par service
- **Contenu** :
  - Graphique en barres par service
  - Graphique circulaire avec pourcentages
  - Tableau détaillé avec statuts

### 4. **Tendances.tsx** - Analyse des Tendances
- **Rôle** : Analyse des tendances et évolutions
- **Contenu** :
  - Graphique d'évolution temporelle
  - Cartes de tendances (augmentation, diminution, stable)
  - Analyse des tendances par service
  - Indicateurs de tendances

### 5. **Performance.tsx** - Métriques de Performance
- **Rôle** : Indicateurs de performance clinique
- **Contenu** :
  - Graphiques en jauge (Taux de résolution, Temps de réponse, etc.)
  - Graphique radar de performance par service
  - Métriques détaillées (Satisfaction, Efficacité)
  - Tableau de synthèse des performances

## 🔧 Utilisation

### Intégration dans le Dashboard Unifié

```tsx
import AnalyticsContent from '@/components/Analytics/AnalyticsContent'

// Dans le dashboard unifié
<AnalyticsContent selectedPeriod="30j" />
```

### Utilisation Individuelle des Composants

```tsx
import { VueEnsemble, ParService, Tendances, Performance } from '@/components/Analytics'

// Utilisation directe
<VueEnsemble analyticsData={data} />
<ParService analyticsData={data} />
<Tendances analyticsData={data} />
<Performance analyticsData={data} />
```

## 📊 Interface des Données

```typescript
interface AnalyticsData {
  plaintesParService: { service: string; count: number; percentage: number }[]
  plaintesParPriorite: { priorite: string; count: number; color: string }[]
  evolutionTemporelle: { date: string; count: number }[]
  tempsMoyenTraitement: number
  tauxSatisfaction: number
  metriquesPerformance: {
    taux_resolution: number
    temps_reponse_moyen: number
    qualite_soins: number
    taux_recurrence: number
    satisfaction_client: number
    temps_traitement_moyen: number
  }
  tendances: {
    augmentation: string[]
    diminution: string[]
    stable: string[]
  }
}
```

## 🎨 Styles

Tous les composants utilisent :
- **Tailwind CSS** pour le styling
- **Glass morphism** pour les cartes
- **Plotly.js** pour les graphiques interactifs
- **Heroicons** pour les icônes

## 🔄 État et Gestion des Données

- **Chargement** : Indicateurs de chargement avec animation
- **Erreur** : Fallback vers des données de démonstration
- **Périodes** : Données différentes selon la période sélectionnée (7j, 30j, 90j)
- **Temps réel** : Badge "Données en temps réel" avec animation

## 🚀 Fonctionnalités

### ✅ Implémentées
- [x] Navigation par onglets
- [x] Graphiques interactifs
- [x] Données de démonstration
- [x] Gestion d'erreur
- [x] Responsive design
- [x] Intégration dashboard unifié

### 🔄 En Cours
- [ ] Connexion API réelle
- [ ] Export des données
- [ ] Filtres avancés
- [ ] Notifications temps réel

## 📝 Notes de Développement

- Les composants sont modulaires et réutilisables
- Chaque composant gère son propre état de chargement
- Les données de démonstration sont réalistes et cohérentes
- L'interface est optimisée pour mobile et desktop 