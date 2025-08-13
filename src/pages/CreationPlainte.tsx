import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleCreationForm from '@/components/SimpleCreationForm';
import TaskNotificationManager from '@/components/TaskNotificationManager';

export default function CreationPlaintePage() {
  const navigate = useNavigate();
  const [createdPlainteId, setCreatedPlainteId] = useState<number | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const handlePlainteCreated = (response: any) => {
    // Récupérer les informations de la réponse
    const plainteId = parseInt(response.id);
    const taskInfo = response.task_info;
    
    console.log('Plainte créée:', { plainteId, taskInfo });
    
    // Stocker les informations pour les notifications
    setCreatedPlainteId(plainteId);
    if (taskInfo?.task_id) {
      setTaskId(taskInfo.task_id);
    }
    
    // Afficher un message initial
    alert(`Plainte #${response.numero_plainte} créée avec succès !
    
✅ Génération du rapport PDF en cours...
🤖 Analyse IA en cours de traitement...

Vous serez notifié(e) une fois le traitement terminé.`);
  };

  const handleTaskComplete = (result: any) => {
    console.log('Traitement terminé:', result);
    
    // Proposer à l'utilisateur de voir le détail ou retourner à la liste
    const choice = confirm(`Le traitement de la plainte est terminé !
    
✅ Rapport PDF généré
🤖 Analyse IA complète

Voulez-vous voir le détail de la plainte maintenant ?`);
    
    if (choice && createdPlainteId) {
      navigate(`/plaintes/${createdPlainteId}`);
    } else {
      navigate('/plaintes');
    }
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
      
      {/* Gestionnaire de notifications pour le traitement en arrière-plan */}
      {createdPlainteId && (
        <TaskNotificationManager
          plainteId={createdPlainteId}
          taskId={taskId || undefined}
          onComplete={handleTaskComplete}
          autoCheck={true}
          checkInterval={3000}
        />
      )}
    </div>
  );
} 