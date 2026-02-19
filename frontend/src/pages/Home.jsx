import { useState, useEffect, useCallback } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import TopShelf from '../components/TopShelf'
import ShelfView from '../components/ShelfView'
import { useToast } from '../hooks/useToast'
import fridgeGradient from '../assets/Final Fridge Gradient.png'
import freezerGradient from '../assets/Final Freezer Gradient.png'
import cabinetGradient from '../assets/Final Cabinet Gradient.png'
import './Home.css'

const BACKGROUNDS = [
  { category: 'Fridge', src: fridgeGradient },
  { category: 'Freezer', src: freezerGradient },
  { category: 'Pantry', src: cabinetGradient },
]

function Home({ refreshTrigger, blurContent }) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeCategory, setActiveCategory] = useState('Fridge')
  const { toast, showToast, handleToastClose } = useToast()
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  // Refresh when items are added from the modal
  useEffect(() => {
    if (refreshTrigger > 0) triggerRefresh()
  }, [refreshTrigger, triggerRefresh])

  return (
    <div className="home-page">
      <div className="scroll-bg">
        {BACKGROUNDS.map(({ category, src }) => (
          <div
            key={category}
            className={`scroll-bg__img ${activeCategory === category ? 'scroll-bg__img--active' : ''}`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>

      <div className={`home-page__content ${blurContent ? 'home-page__content--blurred' : ''}`}>
        <TopShelf refreshKey={refreshKey} onDataChange={triggerRefresh} showToast={showToast} />
        <ShelfView
          refreshKey={refreshKey}
          onDataChange={triggerRefresh}
          onCategoryChange={setActiveCategory}
          showToast={showToast}
        />
      </div>

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
    </div>
  )
}

export default Home
