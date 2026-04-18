import { Box, Container, Typography } from '@mui/material';

export const Footer = () => (
  <div>
    <Container
      maxWidth="xl"
      sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column',
          sm: 'row'
        },
        py: 3
      }}
    >
      <Typography color="text.secondary" variant="caption">
        © {new Date().getFullYear()}
      </Typography>
      <Box sx={{ flexGrow: 1 }} />
    </Container>
  </div>
);
