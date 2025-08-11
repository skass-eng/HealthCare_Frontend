import React from 'react';
import { Box, Typography } from '@mui/material';

const Datasources: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 2 }}>
        Datasources
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        Gestion des sources de données
      </Typography>
    </Box>
  );
};

export default Datasources; 