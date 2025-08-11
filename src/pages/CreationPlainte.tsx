import React from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleCreationForm from '@/components/SimpleCreationForm';

export default function CreationPlaintePage() {
  const navigate = useNavigate();

  const handlePlainteCreated = (plainteId: number) => {
    alert(`Plainte #${plainteId} créée avec succès !`);
    // Rediriger vers la liste des plaintes
    navigate('/plaintes');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <SimpleCreationForm
        onPlainteCreated={handlePlainteCreated}
        onCancel={handleCancel}
      />
    </div>
  );
} 