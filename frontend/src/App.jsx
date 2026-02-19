import { useState, useCallback } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import {
  Typography,
  Button,
  IconButton,
  Box,
  CircularProgress,
  Container,
  Snackbar,
  Alert,
} from '@mui/material'
import { useToast } from './hooks/useToast'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { KitchenProvider, useKitchen } from './context/KitchenContext'
import Home from './pages/Home'
import KitchenSettings from './pages/KitchenSettings'
import Welcome from './pages/Welcome'
import AddItemsModal from './components/AddItemsModal'
import SuggestRecipeModal from './components/SuggestRecipeModal'

const OUTER_BG = '#1e2a1e'

function AppContent() {
  const { kitchenKey, loading, error, retry, needsOnboarding } = useKitchen()
  const navigate = useNavigate()
  const [addItemsOpen, setAddItemsOpen] = useState(false)
  const [suggestRecipeOpen, setSuggestRecipeOpen] = useState(false)
  const [addItemsRefresh, setAddItemsRefresh] = useState(0)
  const { toast, showToast, handleToastClose } = useToast()

  const handleItemsAdded = useCallback((count) => {
    setAddItemsRefresh((k) => k + 1)
    showToast(`${count} item${count !== 1 ? 's' : ''} added!`)
  }, [showToast])

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
      <Box sx={{ minHeight: '100vh', bgcolor: OUTER_BG }}>
        <Welcome />
      </Box>
    )
  }

  if (!kitchenKey) return null

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: OUTER_BG,
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
        {/* Floating glass navigation bar */}
        <Box
          component="nav"
          sx={{
            position: 'sticky',
            top: 12,
            mx: 2,
            mb: 1,
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2.5,
            py: 1.25,
            borderRadius: '16px',
            background: 'rgba(245, 240, 232, 0.45)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.30)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Box
            onClick={() => { navigate('/'); setAddItemsRefresh((k) => k + 1); }}
            sx={{ display: 'flex', alignItems: 'baseline', cursor: 'pointer', userSelect: 'none' }}
          >
            <Typography variant="h6" component="div" fontWeight={700} sx={{ color: 'text.primary' }}>
              ShelfLife
            </Typography>
            <Typography
              variant="caption"
              sx={{ ml: 1, opacity: 0.6, fontStyle: 'italic', color: 'text.secondary', display: { xs: 'none', sm: 'inline' } }}
            >
              Shelves for Life
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<AddIcon />}
            onClick={() => setAddItemsOpen(true)}
            sx={{
              minHeight: 40,
              mr: 0.5,
              color: 'primary.main',
              bgcolor: 'rgba(45, 90, 61, 0.08)',
              '&:hover': { bgcolor: 'rgba(45, 90, 61, 0.15)' },
              fontWeight: 600,
              borderRadius: '12px',
            }}
          >
            Add Items
          </Button>
          <Button
            startIcon={<RestaurantIcon />}
            onClick={() => setSuggestRecipeOpen(true)}
            sx={{
              minHeight: 40,
              mr: 0.5,
              color: 'primary.main',
              bgcolor: 'rgba(45, 90, 61, 0.08)',
              '&:hover': { bgcolor: 'rgba(45, 90, 61, 0.15)' },
              fontWeight: 600,
              borderRadius: '12px',
              display: { xs: 'none', sm: 'inline-flex' },
            }}
          >
            Find Recipe
          </Button>
          <IconButton
            onClick={() => setSuggestRecipeOpen(true)}
            aria-label="Find Recipe"
            sx={{ minWidth: 40, minHeight: 40, color: 'primary.main', display: { xs: 'inline-flex', sm: 'none' } }}
          >
            <RestaurantIcon />
          </IconButton>
          <IconButton
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            sx={{ minWidth: 40, minHeight: 40, color: 'text.secondary' }}
          >
            <SettingsIcon />
          </IconButton>
        </Box>

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
