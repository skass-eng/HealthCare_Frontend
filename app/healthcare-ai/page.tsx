'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheckIcon, ChartBarIcon, DocumentTextIcon, CogIcon, LightBulbIcon, BoltIcon, SparklesIcon, FaceSmileIcon, TagIcon, LightBulbIcon as BulbIcon, ChartBarIcon as AnalyticsIcon, ExclamationTriangleIcon, DocumentTextIcon as SummaryIcon, Cog8ToothIcon } from '@heroicons/react/24/outline'

export default function HealthCareAIPage() {
  const router = useRouter()

  const handleStartNow = () => {
    router.push('/dashboard-unified')
  }

  const handleLearnMore = () => {
    router.push('/analytics-v2')
  }

  const handleFeatureClick = (featureTitle: string) => {
    switch (featureTitle) {
      case 'Gestion Complète':
        router.push('/plaintes-dashboard')
        break
      case 'IA & Optimisation':
        router.push('/ameliorations')
        break
      case 'Administration':
        router.push('/analytics-v2')
        break
      case 'Traitement Rapide':
        router.push('/plaintes/nouvelles')
        break
      case 'Sécurité Renforcée':
        router.push('/parametres')
        break
      case 'Configuration Flexible':
        router.push('/parametres')
        break
      default:
        router.push('/dashboard-unified')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-teal-600/10 to-emerald-600/10 blur-3xl"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 container mx-auto px-6 py-16">
          
          {/* Logo et Titre */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl shadow-2xl mb-8">
              <ShieldCheckIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-teal-700 bg-clip-text text-transparent mb-6">
              HealthCare AI
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 mb-4">
              Gestion Plaintes
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Plateforme intelligente de gestion des plaintes médicales avec analyse IA avancée
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {[
              { icon: DocumentTextIcon, number: '13', label: 'Total Plaintes', color: 'from-blue-500 to-blue-600' },
              { icon: ChartBarIcon, number: '6', label: 'En Cours', color: 'from-teal-500 to-teal-600' },
              { icon: ShieldCheckIcon, number: '1', label: 'Résolues', color: 'from-emerald-500 to-emerald-600' },
              { icon: CogIcon, number: '3.2j', label: 'Temps Moyen', color: 'from-slate-500 to-slate-600' }
            ].map((stat, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl shadow-lg mb-4`}>
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-800 mb-2">{stat.number}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-teal-700 bg-clip-text text-transparent mb-6">
            Fonctionnalités Principales
          </h3>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Découvrez les outils avancés qui révolutionnent la gestion des plaintes médicales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: DocumentTextIcon,
              title: 'Gestion Complète',
              description: 'Interface intuitive pour le suivi et la validation des réclamations avec workflow automatisé',
              color: 'from-blue-500 to-blue-600',
              bgColor: 'from-blue-50 to-blue-100'
            },
            {
              icon: LightBulbIcon,
              title: 'IA & Optimisation',
              description: 'Suggestions intelligentes et améliorations continues basées sur l\'analyse des données',
              color: 'from-teal-500 to-teal-600',
              bgColor: 'from-teal-50 to-teal-100'
            },
            {
              icon: Cog8ToothIcon,
              title: 'Administration',
              description: 'Gestion des organisations et services avec configuration avancée',
              color: 'from-purple-500 to-purple-600',
              bgColor: 'from-purple-50 to-purple-100'
            },
            {
              icon: BoltIcon,
              title: 'Traitement Rapide',
              description: 'Automatisation des processus pour réduire les délais de traitement des plaintes',
              color: 'from-slate-500 to-slate-600',
              bgColor: 'from-slate-50 to-slate-100'
            },
            {
              icon: ShieldCheckIcon,
              title: 'Sécurité Renforcée',
              description: 'Protection des données sensibles avec chiffrement et accès sécurisé',
              color: 'from-indigo-500 to-indigo-600',
              bgColor: 'from-indigo-50 to-indigo-100'
            },
            {
              icon: CogIcon,
              title: 'Configuration Flexible',
              description: 'Paramètres personnalisables pour adapter la plateforme à vos besoins spécifiques',
              color: 'from-cyan-500 to-cyan-600',
              bgColor: 'from-cyan-50 to-cyan-100'
            }
          ].map((feature, index) => (
                         <div key={index} className="relative group cursor-pointer h-full" onClick={() => handleFeatureClick(feature.title)}>
               <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
               <div className={`relative bg-gradient-to-br ${feature.bgColor} rounded-3xl p-8 shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col`}>
                 <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl shadow-lg mb-6`}>
                   <feature.icon className="w-8 h-8 text-white" />
                 </div>
                 <h4 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h4>
                 <p className="text-slate-600 leading-relaxed flex-grow">{feature.description}</p>
                 <div className="mt-4 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   Cliquer pour explorer →
                 </div>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* Fonctionnalités IA & Analytics Avancées */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl mb-8">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-teal-700 bg-clip-text text-transparent mb-6">
            Fonctionnalités IA & Analytics Avancées
          </h3>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Cette section intègre l'intelligence artificielle pour l'analyse automatique des plaintes, la classification intelligente, et les insights prédictifs.
          </p>
        </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {[
              {
                icon: FaceSmileIcon,
                title: 'Analyse de Sentiment',
                description: 'Détection automatique du sentiment (positif, négatif, neutre) dans les plaintes',
                color: 'from-blue-500 to-blue-600',
                badge: '+ Disponible avec l\'API V2',
                badgeColor: 'text-blue-600',
                badgeIcon: SparklesIcon
              },
              {
                icon: TagIcon,
                title: 'Classification Auto',
                description: 'Catégorisation intelligente des plaintes par type, priorité et service',
                color: 'from-teal-500 to-teal-600',
                badge: 'IA Intégrée',
                badgeColor: 'text-teal-600',
                badgeIcon: CogIcon
              },
              {
                icon: BulbIcon,
                title: 'Suggestions IA',
                description: 'Recommandations automatiques pour le traitement des plaintes',
                color: 'from-indigo-500 to-indigo-600',
                badge: 'Machine Learning',
                badgeColor: 'text-indigo-600',
                badgeIcon: SparklesIcon
              },
              {
                icon: AnalyticsIcon,
                title: 'Analytics Prédictive',
                description: 'Prédiction des tendances et identification des risques',
                color: 'from-slate-500 to-slate-600',
                badge: 'Big Data',
                badgeColor: 'text-slate-600',
                badgeIcon: DocumentTextIcon
              },
              {
                icon: ExclamationTriangleIcon,
                title: 'Détection d\'Anomalies',
                description: 'Identification automatique des patterns inhabituels',
                color: 'from-cyan-500 to-cyan-600',
                badge: 'Temps Réel',
                badgeColor: 'text-cyan-600',
                badgeIcon: BoltIcon
              },
              {
                icon: SummaryIcon,
                title: 'Résumé Auto',
                description: 'Génération automatique de résumés et points clés',
                color: 'from-emerald-500 to-emerald-600',
                badge: 'NLP Avancé',
                badgeColor: 'text-emerald-600',
                badgeIcon: DocumentTextIcon
              }
            ].map((feature, index) => (
                         <div key={index} className="relative group h-full">
               <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
               <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/40 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col">
                                   <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl shadow-lg mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                 <h4 className="text-xl font-bold text-slate-800 mb-4">{feature.title}</h4>
                 <p className="text-slate-600 leading-relaxed mb-4 flex-grow">{feature.description}</p>
                                   <div className={`text-sm font-medium ${feature.badgeColor} flex items-center gap-2 mt-auto`}>
                    <feature.badgeIcon className="w-4 h-4" />
                    {feature.badge}
                  </div>
               </div>
             </div>
          ))}
        </div>
      </div>

      {/* Process Flow Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-teal-700 bg-clip-text text-transparent mb-6">
            Workflow de Traitement
          </h3>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Processus optimisé pour une gestion efficace des plaintes
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 rounded-full transform -translate-y-1/2 hidden md:block"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Réception', description: 'Plaintes reçues et enregistrées automatiquement', icon: '📨', color: 'from-blue-500 to-blue-600' },
              { step: '02', title: 'Analyse', description: 'Évaluation IA et classification des priorités', icon: '🔍', color: 'from-teal-500 to-teal-600' },
              { step: '03', title: 'Traitement', description: 'Résolution et suivi des actions correctives', icon: '⚡', color: 'from-emerald-500 to-emerald-600' },
              { step: '04', title: 'Validation', description: 'Contrôle qualité et clôture des dossiers', icon: '✅', color: 'from-slate-500 to-slate-600' }
            ].map((step, index) => (
                           <div key={index} className="relative text-center h-full">
               <div className="relative z-10 h-full flex flex-col">
                 <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${step.color} rounded-3xl shadow-2xl mb-6 mx-auto`}>
                   <span className="text-3xl">{step.icon}</span>
                 </div>
                 <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/40 flex-1 flex flex-col">
                   <div className="text-sm font-bold text-slate-500 mb-2">{step.step}</div>
                   <h4 className="text-lg font-bold text-slate-800 mb-3">{step.title}</h4>
                   <p className="text-sm text-slate-600 flex-grow">{step.description}</p>
                 </div>
               </div>
             </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-teal-600/10 to-emerald-600/10 rounded-3xl blur-xl"></div>
          <div className="relative bg-white/90 backdrop-blur-md rounded-3xl p-12 text-center shadow-2xl border border-white/40">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-teal-700 bg-clip-text text-transparent mb-6">
              Prêt à révolutionner votre gestion des plaintes ?
            </h3>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Rejoignez les établissements de santé qui ont déjà adopté HealthCare AI pour une gestion optimale de leurs plaintes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleStartNow}
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Commencer Maintenant
              </button>
              <button 
                onClick={handleLearnMore}
                className="bg-white/90 backdrop-blur-md text-slate-700 px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-slate-200"
              >
                En savoir plus
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 