import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { useParams } from 'react-router-dom';

const DialoguePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId?: string }>();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          蘇格拉底對話
        </Typography>
        <Typography variant="h6" color="text.secondary">
          AI引導式學習對話
        </Typography>
        {sessionId && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            對話ID: {sessionId}
          </Typography>
        )}
        <Typography variant="body1" sx={{ mt: 2 }}>
          此頁面正在開發中...
        </Typography>
      </Box>
    </Container>
  );
};

export default DialoguePage;