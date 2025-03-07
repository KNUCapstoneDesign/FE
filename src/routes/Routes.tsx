import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import LoginPage from '../pages/LoginPage'
import '../assets/Routes.css'

const Router = () => {
  React.useEffect(() => {
    console.log('Routes loaded')
  }, [])

  return (
    <BrowserRouter>
    <div className='pages-container'>
      <Nav />
      <Routes>
        <Route
        path="/"
        element={<MainPage />}
        />
        <Route
        path='/login'
        element={<LoginPage />}
        />
      </Routes>
      <Footer />
      </div>
    </BrowserRouter>
  )
}

export default Router
