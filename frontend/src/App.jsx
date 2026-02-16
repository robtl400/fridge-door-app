import { Routes, Route } from 'react-router-dom'
import { KitchenProvider } from './context/KitchenContext'
import Home from './pages/Home'
import KitchenSettings from './pages/KitchenSettings'
import Welcome from './pages/Welcome'

function App() {
  return (
    <KitchenProvider>
      <Welcome />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<KitchenSettings />} />
      </Routes>
    </KitchenProvider>
  )
}

export default App
