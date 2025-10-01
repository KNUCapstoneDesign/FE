import Router from './routes/Routes'
import MobileBlocker from './components/MobileBlocker'
function App() {

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (isMobile) {
    return <MobileBlocker />
  }

  return (
    <div>
      <Router />
    </div>
  )
}

export default App
