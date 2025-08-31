import React, {useEffect} from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import MainPage from '../pages/MainPage'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import LoginPage from '../pages/LoginPage'
import '../assets/Routes.css'
import SignupPage from '../pages/SignupPage.tsx'
import MyPage from '../pages/MyPage.tsx'
import Test from '../pages/test.tsx'
import SearchResultPage from '../pages/SearchResultPage.tsx'
import DetailPage from '../pages/DetailPage.tsx'
import AiSearchPage from '../pages/AiSearchPage.tsx'
import MyTravelPage from '../pages/MyTravelPage.tsx'
import MyTravelDetailPage from '../pages/MyTravelDetailPage.tsx'
import IntroPage from '../pages/IntroPage.tsx'
import { useAuthStore } from '../store/useAuthStore.ts'

const SessionChecker = () => {
  const { isAuthenticated, loginTimestamp, logout } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return

    const checkSession = () => {
      const oneHour = 60 * 60 * 1000
      if(loginTimestamp) {
        if (Date.now() > loginTimestamp + oneHour) {
          alert('세션이 만료되었습니다. 다시 로그인해주세요.')
          logout()
          navigate('/login')
        }
      }
    }
      // 👇 페이지 로드 시 즉시 한번 실행합니다.
      checkSession()

      // 👇 그 후, 1분마다 주기적으로 실행합니다.
      const interval = setInterval(checkSession, 60000)

    // 컴포넌트가 언마운트될 때 인터벌 정리
    return () => clearInterval(interval)
  }, [isAuthenticated, loginTimestamp, logout, navigate])

  return null // 이 컴포넌트는 UI를 렌더링하지 않습니다.
}

const InnerRouter = () => {
  const location = useLocation();

  React.useEffect(() => {
    if (location.pathname === '/') {
      document.body.classList.add('no-padding-top');
    } else {
      document.body.classList.remove('no-padding-top');
    }
    // cleanup: 페이지 이동 시 클래스 제거
    return () => {
      document.body.classList.remove('no-padding-top');
    };
  }, [location.pathname]);

  return (
    <div className="pages-container" style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
      {location.pathname !== '/' && <Nav />}
      <SessionChecker />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/test" element={<Test />} />
          <Route path="/searchresult" element={<SearchResultPage />} />
          <Route path="/detail/:id/:typeid" element={<DetailPage />} />
          <Route path="/AiSearch" element={<AiSearchPage />} />
          <Route path="/mytravel" element={<MyTravelPage />} />
          <Route path="/mytravel/:id" element={<MyTravelDetailPage />} />
        </Routes>
      </div>
      {location.pathname !== '/' && <Footer />}
    </div>
  );
};

const Router = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID!}>
      <BrowserRouter>
        <InnerRouter />
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default Router
