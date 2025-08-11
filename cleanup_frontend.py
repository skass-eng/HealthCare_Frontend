#!/usr/bin/env python3
"""
PLAN DE NETTOYAGE DU FRONTEND - Architecture ODYSSEE
Ce script liste et supprime les fichiers de développement/test qui polluent le frontend
"""

import os
import shutil
from pathlib import Path

# Répertoire racine du frontend
FRONTEND_ROOT = Path(".")

# Composants ESSENTIELS à conserver
ESSENTIAL_COMPONENTS = {
    # Composants de production
    "CreationPlainte.tsx",
    "DashboardUnifiedPlaintes.tsx", 
    "PlaignantInfo.tsx",
    "FormulaireManuel.tsx",
    "SimpleCreationForm.tsx",
    "AdminPanelV2.tsx",
    "AnalyticsContent.tsx",
    "ExportModal.tsx",
    "GlobalModals.tsx",
    "ModalGlobal.tsx",
    "NotificationToast.tsx",
    "ServiceFormModal.tsx",
    "UserFormModal.tsx",
    "ServicesOverview.tsx",
    "Sidebar.tsx",
    "VueEnsemble.tsx",
    "PlotlyChart.tsx",
    "ManualFormPanel.tsx",
    "PdfUploadPanel.tsx",
    "PhotoUploadPanel.tsx",
    "index.ts"
}

# Fichiers/Composants DE TEST/DEV à supprimer
FRONTEND_FILES_TO_DELETE = [
    # Composants de test
    "src/components/SimpleTest.tsx",
    "src/components/TestInput.tsx", 
    "src/components/DebugForm.tsx",
    
    # Documentation temporaire
    "src/components/README_ServiceFormModal.md",
    "RESUME_CORRECTIONS.md",
]

# Fichiers essentiels du frontend à conserver
ESSENTIAL_FRONTEND_FILES = {
    "package.json",
    "index.html",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "tsconfig.json",
    "tsconfig.node.json",
    "README.md",
    ".env",
    "vercel.json"
}

def analyze_frontend():
    """Analyser les fichiers du frontend"""
    print("🔍 ANALYSE DU PROJET FRONTEND")
    print("=" * 50)
    
    # Analyser les composants
    components_dir = FRONTEND_ROOT / "src" / "components"
    all_components = []
    test_components = []
    essential_components = []
    
    if components_dir.exists():
        for item in components_dir.iterdir():
            if item.suffix == ".tsx":
                all_components.append(item.name)
                
                if any(keyword in item.name.lower() for keyword in ["test", "debug", "simple"]):
                    test_components.append(item.name)
                elif item.name in ESSENTIAL_COMPONENTS:
                    essential_components.append(item.name)
    
    print(f"⚛️ Total des composants: {len(all_components)}")
    print(f"✅ Composants essentiels: {len(essential_components)}")
    print(f"🧪 Composants de test/dev: {len(test_components)}")
    
    print(f"\n🧪 COMPOSANTS DE TEST/DEV DÉTECTÉS:")
    for c in test_components:
        print(f"   - {c}")
    
    # Analyser les fichiers de documentation
    docs_files = []
    for item in FRONTEND_ROOT.rglob("*.md"):
        if "README" not in item.name and "RESUME" in item.name:
            docs_files.append(str(item.relative_to(FRONTEND_ROOT)))
    
    print(f"\n📄 FICHIERS DE DOC TEMPORAIRE:")
    for d in docs_files:
        print(f"   - {d}")
    
    return test_components, docs_files

def clean_frontend(dry_run=True):
    """Nettoyer le frontend"""
    
    print(f"\n🧹 NETTOYAGE DU FRONTEND ({'DRY RUN' if dry_run else 'RÉEL'})")
    print("=" * 50)
    
    deleted_count = 0
    
    for file_path in FRONTEND_FILES_TO_DELETE:
        full_path = FRONTEND_ROOT / file_path
        if full_path.exists():
            print(f"🗑️ {'[DRY RUN] ' if dry_run else ''}Suppression: {file_path}")
            if not dry_run:
                full_path.unlink()
            deleted_count += 1
    
    print(f"\n📊 Résultat: {deleted_count} éléments {'seraient supprimés' if dry_run else 'supprimés'}")
    
    return deleted_count

def create_frontend_structure():
    """Afficher la structure propre du frontend"""
    print(f"\n✨ STRUCTURE FINALE DU FRONTEND")
    print("=" * 50)
    
    structure = """
explorer_frontend/
├── 📄 package.json                       # Dépendances NPM
├── 📄 index.html                         # Point d'entrée HTML
├── 📄 vite.config.ts                     # Configuration Vite
├── 📄 tailwind.config.js                 # Configuration Tailwind
├── 📄 tsconfig.json                      # Configuration TypeScript
├── 📄 .env                              # Variables d'environnement
├── 📁 src/
│   ├── 📄 App.tsx                        # Composant principal
│   ├── 📄 main.tsx                       # Point d'entrée React
│   ├── 📁 components/                    # Composants React
│   │   ├── 📄 CreationPlainte.tsx        # Création de plaintes
│   │   ├── 📄 DashboardUnifiedPlaintes.tsx # Dashboard principal
│   │   ├── 📄 AdminPanelV2.tsx           # Panel d'administration
│   │   ├── 📄 FormulaireManuel.tsx       # Formulaire manuel
│   │   ├── 📄 SimpleCreationForm.tsx     # Formulaire simple
│   │   ├── 📄 ServicesOverview.tsx       # Vue des services
│   │   ├── 📄 AnalyticsContent.tsx       # Contenu analytique
│   │   ├── 📄 NotificationToast.tsx      # Notifications
│   │   ├── 📄 Sidebar.tsx                # Barre latérale
│   │   └── 📄 index.ts                   # Exports des composants
│   ├── 📁 hooks/                         # Hooks React personnalisés
│   ├── 📁 lib/                           # Utilitaires et clients API
│   ├── 📁 pages/                         # Pages de l'application
│   ├── 📁 store/                         # État global (Zustand)
│   ├── 📁 styles/                        # Styles CSS
│   └── 📁 types/                         # Types TypeScript
└── 📁 public/                            # Assets statiques
    """
    
    print(structure)

def show_component_summary():
    """Afficher un résumé des composants essentiels"""
    print(f"\n📋 COMPOSANTS ESSENTIELS CONSERVÉS")
    print("=" * 50)
    
    components_info = {
        "🏥 Gestion des Plaintes": [
            "CreationPlainte.tsx - Interface principale de création",
            "DashboardUnifiedPlaintes.tsx - Dashboard des plaintes", 
            "FormulaireManuel.tsx - Formulaire manuel détaillé",
            "SimpleCreationForm.tsx - Formulaire simplifié",
            "PlaignantInfo.tsx - Informations du plaignant"
        ],
        "⚙️ Administration": [
            "AdminPanelV2.tsx - Panel d'administration",
            "ServicesOverview.tsx - Gestion des services",
            "UserFormModal.tsx - Gestion des utilisateurs",
            "ServiceFormModal.tsx - Gestion des services"
        ],
        "📊 Analytics": [
            "AnalyticsContent.tsx - Contenu analytique",
            "PlotlyChart.tsx - Graphiques interactifs",
            "ExportModal.tsx - Export de données"
        ],
        "🎨 Interface": [
            "Sidebar.tsx - Navigation principale",
            "NotificationToast.tsx - Notifications",
            "GlobalModals.tsx - Modales globales",
            "ModalGlobal.tsx - Modal générique"
        ]
    }
    
    for category, components in components_info.items():
        print(f"\n{category}:")
        for comp in components:
            print(f"   ✅ {comp}")

if __name__ == "__main__":
    print("🌐 NETTOYAGE FRONTEND - HealthCare AI Architecture ODYSSEE")
    print("=" * 60)
    
    # 1. Analyser les fichiers
    test_components, docs_files = analyze_frontend()
    
    # 2. Simulation du nettoyage
    clean_frontend(dry_run=True)
    
    # 3. Afficher la structure finale
    create_frontend_structure()
    
    # 4. Résumé des composants
    show_component_summary()
    
    print(f"\n❓ VOULEZ-VOUS PROCÉDER AU NETTOYAGE DU FRONTEND ?")
    print(f"   - {len(test_components)} composants de test/dev seront supprimés")
    print(f"   - {len(docs_files)} fichiers de doc temporaire seront supprimés")
    print(f"   - Les composants de production seront conservés")
    print(f"\n🚀 Pour lancer le nettoyage: python cleanup_frontend.py --execute")
