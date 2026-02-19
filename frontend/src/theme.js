import { createTheme } from '@mui/material/styles'
import '@fontsource/nunito/400.css'
import '@fontsource/nunito/500.css'
import '@fontsource/nunito/600.css'
import '@fontsource/nunito/700.css'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2d5a3d',       // forest green
      light: '#4a7c5c',      // forest light
      contrastText: '#fff',
    },
    secondary: {
      main: '#8a9a7b',       // sage
    },
    background: {
      default: '#f5f0e8',    // parchment
      paper: '#fff',
    },
    text: {
      primary: '#5c4a3a',    // bark
      secondary: '#7a6555',  // bark-light
    },
    warning: {
      main: '#d4742c',       // burnt orange
      light: '#fbe8d4',      // light amber
    },
    error: {
      main: '#c0392b',       // deep warm red
    },
    success: {
      main: '#2d5a3d',       // forest green
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
  },
})

export default theme
