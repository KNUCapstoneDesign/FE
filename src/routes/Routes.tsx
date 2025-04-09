import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import LoginPage from '../pages/LoginPage'
import '../assets/Routes.css'
import SignupPage from '../pages/SignupPage.tsx'
import MyPage from '../pages/MyPage.tsx'

const Router = () => {
  React.useEffect(() => {
    console.log('Routes loaded')
  }, [])

  return (
    <BrowserRouter>
      <div className="pages-container">
        <Nav />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default Router