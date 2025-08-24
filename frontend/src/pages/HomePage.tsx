import React from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          問AI 2.0
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          AI教育平台 - 透過蘇格拉底式對話培養批判性思維
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              智能引導對話
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI不會直接給答案，而是透過問題引導您思考，培養解決問題的能力
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              多模態理解
            </Typography>
            <Typography variant="body2" color="text.secondary">
              支援圖片、語音等多種輸入方式，全方位理解您的學習需求
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              個人化學習
            </Typography>
            <Typography variant="body2" color="text.secondary">
              根據學習進度和理解程度，提供量身定制的學習路徑
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;