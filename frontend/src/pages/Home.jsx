import { useState, useCallback } from 'react'
import TopShelf from '../components/TopShelf'
import ShelfView from '../components/ShelfView'
import fridgeGradient from '../assets/Final Fridge Gradient.png'
import freezerGradient from '../assets/Final Freezer Gradient.png'
import cabinetGradient from '../assets/Final Cabinet Gradient.png'
import './Home.css'

const BACKGROUNDS = [
  { category: 'Fridge', src: fridgeGradient },
  { category: 'Freezer', src: freezerGradient },
  { category: 'Pantry', src: cabinetGradient },
]

function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [activeCategory, setActiveCategory] = useState('Fridge')
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

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

      <div className="home-page__content">
        <TopShelf refreshKey={refreshKey} onDataChange={triggerRefresh} />
        <ShelfView
          refreshKey={refreshKey}
          onDataChange={triggerRefresh}
          onCategoryChange={setActiveCategory}
        />
      </div>
    </div>
  )
}

export default Home
