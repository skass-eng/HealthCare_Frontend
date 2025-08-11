import React from 'react';
import { Box, Typography } from '@mui/material';

const Projects: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'white', mb: 2 }}>
        Projets
      </Typography>
      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        Gestion des projets ODYSSEE
      </Typography>
    </Box>
  );
};

export default Projects; 