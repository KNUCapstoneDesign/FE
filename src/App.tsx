import Router from './routes/Routes'
import MobileBlocker from './components/MobileBlocker'
import { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'

function App() {

  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  if (isMobile) {
    return <MobileBlocker />
  }

  // AOS 초기화: 페이지 진입 시 한 번만 실행
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
    })
  }, [])

  return (
    <div>
      <Router />
    </div>
  )
}

export default App
