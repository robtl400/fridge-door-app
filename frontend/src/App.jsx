import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { KitchenProvider, useKitchen } from './context/KitchenContext'
import Home from './pages/Home'
import KitchenSettings from './pages/KitchenSettings'
import Welcome from './pages/Welcome'

function AppContent() {
  const { kitchenKey, loading, error, retry } = useKitchen()
  const navigate = useNavigate()
  const [addItemsOpen, setAddItemsOpen] = useState(false)
  const [suggestRecipeOpen, setSuggestRecipeOpen] = useState(false)

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        <CircularProgress sx={{ color: 'primary.main' }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="sm" sx={{ pt: 10, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error === 'network'
              ? 'Could not connect to the server. Please check your connection.'
              : 'Could not create your kitchen. Please try again.'}
          </Typography>
          <Button variant="contained" onClick={retry}>
            Try Again
          </Button>
        </Container>
      </Box>
    )
  }

  if (!kitchenKey) return null

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#e8e0d4',
    }}>
      {/* Centered app shell with border */}
      <Box sx={{
        maxWidth: 900,
        mx: 'auto',
        minHeight: '100vh',
        bgcolor: 'transparent',
        borderLeft: { sm: '1px solid #d7ccc8' },
        borderRight: { sm: '1px solid #d7ccc8' },
        boxShadow: { sm: '0 0 24px rgba(0,0,0,0.06)' },
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        <AppBar
          position="sticky"
          sx={{ bgcolor: 'primary.main' }}
          /* No elevation — our boxShadow override in theme handles it */
        >
          <Toolbar>
            <Typography
              variant="h6"
              component="div"
              fontWeight={700}
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              ShelfLife
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setAddItemsOpen(true)}
              sx={{ minHeight: 44, mr: 0.5 }}
            >
              Add Items
            </Button>
            <Button
              color="inherit"
              startIcon={<RestaurantIcon />}
              onClick={() => setSuggestRecipeOpen(true)}
              sx={{ minHeight: 44, mr: 0.5, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Suggest Recipe
            </Button>
            <IconButton
              color="inherit"
              onClick={() => setSuggestRecipeOpen(true)}
              aria-label="Suggest Recipe"
              sx={{ minWidth: 44, minHeight: 44, display: { xs: 'inline-flex', sm: 'none' } }}
            >
              <RestaurantIcon />
            </IconButton>
            <IconButton
              color="inherit"
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1 }}>
          <Welcome />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<KitchenSettings />} />
          </Routes>
        </Box>
      </Box>

      {/* Add Items stub modal */}
      <Dialog open={addItemsOpen} onClose={() => setAddItemsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Items</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Item search and adding functionality coming soon.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddItemsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Suggest Recipe stub modal */}
      <Dialog open={suggestRecipeOpen} onClose={() => setSuggestRecipeOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Suggest Recipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Recipe suggestions based on your ingredients coming soon.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuggestRecipeOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

function App() {
  return (
    <KitchenProvider>
      <AppContent />
    </KitchenProvider>
  )
}

export default App
