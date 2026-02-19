import { useState, useCallback } from 'react'
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
  Snackbar,
  Alert,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { KitchenProvider, useKitchen } from './context/KitchenContext'
import Home from './pages/Home'
import KitchenSettings from './pages/KitchenSettings'
import Welcome from './pages/Welcome'
import AddItemsModal from './components/AddItemsModal'
import SuggestRecipeModal from './components/SuggestRecipeModal'

function AppContent() {
  const { kitchenKey, loading, error, retry, needsOnboarding } = useKitchen()
  const navigate = useNavigate()
  const [addItemsOpen, setAddItemsOpen] = useState(false)
  const [suggestRecipeOpen, setSuggestRecipeOpen] = useState(false)
  const [addItemsRefresh, setAddItemsRefresh] = useState(0)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })

  const handleItemsAdded = useCallback((count) => {
    setAddItemsRefresh((k) => k + 1)
    setToast({
      open: true,
      message: `${count} item${count !== 1 ? 's' : ''} added!`,
      severity: 'success',
    })
  }, [])

  const handleToastClose = (_, reason) => {
    if (reason === 'clickaway') return
    setToast((prev) => ({ ...prev, open: false }))
  }

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

  // No kitchen key yet — show only the Welcome onboarding dialog
  if (!kitchenKey && needsOnboarding) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#2a2a2a' }}>
        <Welcome />
      </Box>
    )
  }

  if (!kitchenKey) return null

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#2a2a2a',
    }}>
      {/* Centered app shell */}
      <Box sx={{
        maxWidth: 900,
        mx: 'auto',
        minHeight: '100vh',
        bgcolor: 'transparent',
        borderRadius: { sm: '24px' },
        boxShadow: { sm: '0 0 30px rgba(0,0,0,0.12)' },
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        <AppBar
          position="sticky"
          sx={{ bgcolor: 'primary.main' }}
        >
          <Toolbar>
            <Box
              onClick={() => { navigate('/'); setAddItemsRefresh((k) => k + 1); }}
              sx={{ display: 'flex', alignItems: 'baseline', cursor: 'pointer', userSelect: 'none' }}
            >
              <Typography variant="h6" component="div" fontWeight={700}>
                ShelfLife
              </Typography>
              <Typography
                variant="caption"
                sx={{ ml: 1, opacity: 0.8, fontStyle: 'italic', display: { xs: 'none', sm: 'inline' } }}
              >
                Shelves for Life
              </Typography>
            </Box>
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
          <Routes>
            <Route path="/" element={<Home refreshTrigger={addItemsRefresh} blurContent={addItemsOpen} />} />
            <Route path="/settings" element={<KitchenSettings />} />
          </Routes>
        </Box>
      </Box>

      {/* Add Items Modal */}
      <AddItemsModal
        open={addItemsOpen}
        onClose={() => setAddItemsOpen(false)}
        kitchenKey={kitchenKey}
        onItemsAdded={handleItemsAdded}
      />

      {/* Suggest Recipe Modal */}
      <SuggestRecipeModal
        open={suggestRecipeOpen}
        onClose={() => setSuggestRecipeOpen(false)}
        kitchenKey={kitchenKey}
      />

      {/* Toast for items added */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
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
