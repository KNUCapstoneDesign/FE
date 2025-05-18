import styles from '../assets/MainPage.module.css'
import Hero from '../components/Hero'
import mainpic from '/mainpic.jpg'
import HotCourses from '../components/TestPage.tsx'
import { useAuthStore } from '../store/useAuthStore.ts'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect } from 'react'

const MainPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    const fetchUserData = async () => {
      try {
        const res = await axios.post('http://localhost:5001/api/auth/google', { code })
        const { token, name, email, phone, isExistingMember } = res.data

        // AuthStore에 로그인 정보 저장
        login({ token, name, email, phone })

        localStorage.setItem('token', token)

        if (isExistingMember) {
          navigate('/')
        } else {
          navigate('/signup')
        }
      } catch (error) {
        console.error('구글 로그인 처리 실패:', error)
      }
    }

    fetchUserData()
  }, [navigate, login])

  return (
    <div>
      <div className={styles.mainPage}>
        <Hero mainpic={mainpic} />
        <HotCourses />
        <h1 className={styles.heading}>메인메인메인메인메인메인메인메인</h1>
        <p className={styles.description}>내용내용내용내용내용내용내용내용내용내용내용내용내용</p>
        <br />
      </div>
      <div className={styles.HotCourseContainer}></div>
    </div>
  )
}

export default MainPage