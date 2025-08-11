import React from 'react';
import { Box, Typography } from '@mui/material';

const Analytics: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 2 }}>
        Analytics
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        Widgets d'analyse et visualisations
      </Typography>
    </Box>
  );
};

export default Analytics; 