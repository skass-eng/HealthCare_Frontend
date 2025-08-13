import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { PlainteCreate, Service } from '@/types';

interface SimpleCreationFormProps {
  onPlainteCreated?: (plainteId: number) => void;
  onCancel?: () => void;
}

export default function SimpleCreationForm({ onPlainteCreated, onCancel }: SimpleCreationFormProps) {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    service_id: '',
    date_incident: ''
  });

  // Charger les services au montage
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await apiService.getServices();
      if (response.success && response.data) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des services:', error);
      alert('Erreur lors du chargement des services');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.titre.trim()) {
      alert('Le titre est obligatoire');
      return false;
    }
    if (!formData.description.trim()) {
      alert('La description est obligatoire');
      return false;
    }
    if (!formData.service_id) {
      alert('Veuillez sélectionner un service');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    // 🚀 Affichage immédiat que la soumission a commencé
    console.log('🚀 Début création de la plainte...');

    try {
      const plainteData: PlainteCreate = {
        titre: formData.titre,
        description: formData.description,
        service_id: parseInt(formData.service_id),
        date_incident: formData.date_incident || undefined
      };

      const response = await apiService.createPlainte(plainteData);
      
      if (response.success && response.data) {
        // 🎉 Succès - notification immédiate
        alert('✅ Plainte créée avec succès !\n\n Génération du rapport PDF en cours...\n🤖 Analyse IA démarrée...\n\nVous serez notifié(e) une fois terminé.');
        
        // Notifier le parent
        if (onPlainteCreated) {
          onPlainteCreated(response.data.id);
        }

        // Réinitialiser le formulaire
        setFormData({
          titre: '',
          description: '',
          service_id: '',
          date_incident: ''
        });
      } else {
        // ❌ Erreur de réponse
        alert('❌ Erreur lors de la création de la plainte');
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      // ❌ Erreur de network/API
      alert('❌ Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '20px auto',
      padding: '30px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      border: '1px solid #e0e0e0'
    }}>
      <h2 style={{
        margin: '0 0 30px 0',
        color: '#333',
        fontSize: '24px',
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        📝 Création d'une nouvelle plainte
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Titre */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '14px'
          }}>
            Titre de la plainte *
          </label>
          <input
            type="text"
            value={formData.titre}
            onChange={(e) => handleInputChange('titre', e.target.value)}
            placeholder="Titre descriptif de la plainte"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white',
              color: '#333',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Service */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '14px'
          }}>
            Service concerné *
          </label>
          <select
            value={formData.service_id}
            onChange={(e) => handleInputChange('service_id', e.target.value)}
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white',
              color: '#333',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Sélectionner un service</option>
            {services.map((service) => (
              <option key={service.id} value={service.id.toString()}>
                {service.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '14px'
          }}>
            Description détaillée *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Décrivez en détail les circonstances, les conséquences et les demandes du plaignant..."
            required
            rows={6}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white',
              color: '#333',
              boxSizing: 'border-box',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Date d'incident */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333',
            fontSize: '14px'
          }}>
            Date de l'incident (optionnel)
          </label>
          <input
            type="date"
            value={formData.date_incident}
            onChange={(e) => handleInputChange('date_incident', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '16px',
              backgroundColor: 'white',
              color: '#333',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Informations */}
        <div style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
            ℹ️ Processus automatique
          </h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
            <li>La plainte sera sauvegardée dans la base de données</li>
            <li>Une analyse IA sera automatiquement déclenchée</li>
            <li>Un PDF sera généré et archivé</li>
            <li>Une réponse intelligente sera rédigée</li>
          </ul>
        </div>

        {/* Boutons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '15px',
          marginTop: '20px'
        }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '12px 24px',
              border: '2px solid #6c757d',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#6c757d',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Annuler
          </button>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Création...' : 'Créer la plainte'}
          </button>
        </div>
      </form>
    </div>
  );
} 