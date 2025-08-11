import Select from 'react-select';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../store/slices/userSlice';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import PlaignantInfo from './PlaignantInfo';
import { apiService } from '../lib/api';

interface FormulaireManuelProps {
  formData: {
    titre: string;
    description: string;
    nom_plaignant: string;
    prenom_plaignant: string;
    email_plaignant: string;
    telephone_plaignant: string;
    mode_reception: string;
    date_incident: string;
    documents: File[];
    assigned_user: string;
    [key: string]: any;
  };
  errors: { [key: string]: string };
  handleChange: (field: string, value: string) => void;
  handleFileChange: (field: string, files: File[]) => void;
}

export default function FormulaireManuel({ formData, errors, handleChange, handleFileChange }: FormulaireManuelProps) {
  const dispatch = useDispatch<any>();
  const users = useSelector((state: any) => state.user.users);
  const [totalComplaints, setTotalComplaints] = useState<number>(0);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    dispatch(fetchUsers());

    const fetchTotalComplaints = async () => {
      try {
        const response = await apiService.getTotalPlaintesAnnuelles();
        if (response.success && response.data !== undefined) {
          setTotalComplaints(response.data);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nombre de plaintes:', error);
        setTotalComplaints(0); // Valeur par défaut en cas d'erreur
      }
    };

    const fetchServices = async () => {
      try {
        console.log('🔍 Récupération des services...');
        const response = await apiService.getServicesForComplaint();
        console.log('📋 Services récupérés:', response);
        if (response.success && response.data) {
          console.log('✅ Services chargés:', response.data.length, 'services');
          setServices(response.data);
          // Définir un service par défaut si aucun n'est sélectionné
          if (!formData.service_id && response.data.length > 0) {
            handleChange('service_id', response.data[0].id.toString());
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des services:', error);
        setServices([]);
      }
    };

    fetchTotalComplaints();
    fetchServices();
  }, [dispatch]);

  const defaultTitle = `PL_${new Date().toISOString().split('T')[0]}_${totalComplaints + 1}`;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
            <DocumentTextIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Informations de la plainte</h3>
            <p className="text-gray-600 text-xs">Détails principaux</p>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Titre de la plainte *
            </label>
            <input
              type="text"
              required
              value={formData.titre || defaultTitle}
              onChange={(e) => handleChange('titre', e.target.value)}
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
                errors.titre 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Résumé court de la plainte"
            />
            {errors.titre && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.titre}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Description détaillée *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 resize-none transition-all bg-white ${
                errors.description 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
              }`}
              placeholder="Décrivez en détail la plainte, les faits, les dates, les personnes impliquées..."
              rows={5}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Mode de réception *
            </label>
            <select
              required
              value={formData.mode_reception}
              onChange={(e) => handleChange('mode_reception', e.target.value)}
              className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white ${
                errors.mode_reception 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
              }`}
            >
              <option value="">Sélectionnez le mode de réception</option>
              <option value="email">Email</option>
              <option value="papier">Papier</option>
              <option value="autre">Autre</option>
            </select>
            {errors.mode_reception && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.mode_reception}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Documents liés à la plainte
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileChange('documents', Array.from(e.target.files || []))}
              className="w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all bg-white border-gray-200 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Service concerné *
            </label>
            <Select
              options={services.map((service: any) => ({
                value: service.id,
                label: service.nom || service.name || `Service ${service.id}`
              }))}
              value={services
                .map((service: any) => ({
                  value: service.id,
                  label: service.nom || service.name || `Service ${service.id}`
                }))
                .find((option: any) => option.value.toString() === formData.service_id) || null}
              onChange={(option: any) => handleChange('service_id', option ? option.value.toString() : '')}
              placeholder="Sélectionnez un service"
              isClearable
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  borderColor: errors.service_id ? '#ef4444' : '#10b981',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.08)',
                  minHeight: '44px',
                  fontWeight: '600',
                  background: 'white',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#d1fae5' : 'white',
                  color: state.isSelected ? 'white' : '#1e293b',
                  fontWeight: state.isSelected ? '700' : '500',
                  fontSize: '1rem',
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  boxShadow: '0 8px 32px rgba(16,185,129,0.15)',
                  zIndex: 20,
                }),
              }}
            />
            {errors.service_id && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.service_id}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Assigné à *
            </label>
            <Select
              options={users.map((user: any) => ({
                value: user.id,
                label: user.nom && user.prenom ? `${user.nom} ${user.prenom}` : user.nom || user.name || user.email || `Utilisateur ${user.id}`
              }))}
              value={users
                .map((user: any) => ({
                  value: user.id,
                  label: user.nom && user.prenom ? `${user.nom} ${user.prenom}` : user.nom || user.name || user.email || `Utilisateur ${user.id}`
                }))
                .find((option: any) => option.value === formData.assigned_user) || null}
              onChange={(option: any) => handleChange('assigned_user', option ? option.value : '')}
              placeholder="Sélectionnez un utilisateur"
              isClearable
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  borderColor: errors.assigned_user ? '#ef4444' : '#3b82f6',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
                  minHeight: '44px',
                  fontWeight: '600',
                  background: 'white',
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#e0e7ff' : 'white',
                  color: state.isSelected ? 'white' : '#1e293b',
                  fontWeight: state.isSelected ? '700' : '500',
                  fontSize: '1rem',
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '0.75rem',
                  boxShadow: '0 8px 32px rgba(59,130,246,0.15)',
                  zIndex: 20,
                }),
              }}
            />
            {errors.assigned_user && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.assigned_user}
              </p>
            )}
          </div>
        </div>
      </div>
      <PlaignantInfo formData={formData} errors={errors} handleChange={handleChange} />
    </>
  );
}