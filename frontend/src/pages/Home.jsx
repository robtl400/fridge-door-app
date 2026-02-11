import { Typography, Container } from '@mui/material'

function Home() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Fridge Door
      </Typography>
      <Typography variant="body1">
        Welcome to Fridge Door.
      </Typography>
    </Container>
  )
}

export default Home
