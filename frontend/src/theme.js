import { createTheme } from '@mui/material/styles'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/500.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#c4785b',       // terracotta
      contrastText: '#fff',
    },
    secondary: {
      main: '#8a7e74',       // warm gray
    },
    background: {
      default: '#faf6f0',    // cream
      paper: '#fff',
    },
    text: {
      primary: '#4a3f35',    // warm dark brown
      secondary: '#8a7e74',  // warm gray
    },
    warning: {
      main: '#e67e22',
      light: '#f5e0e0',      // rose light (used for TopShelf)
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#8a7e74',
    },
  },
  typography: {
    fontFamily: '"Nunito", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,        // global default rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,  // pill-shaped buttons
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
})

export default theme
