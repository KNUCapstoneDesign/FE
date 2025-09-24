import styles from '../assets/MainPage.module.css'
import Hero from '../components/Hero'
import mainpic1 from '/mainpic1.jpg'
import Course from '../components/Course.tsx'
import { useAuthStore } from '../store/useAuthStore.ts'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'
import ChatBot from '../components/ChatBot.tsx'
import { IoIosChatboxes } from 'react-icons/io'

const MainPage = () => {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showChatBot, setShowChatBot] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    const fetchUserData = async () => {
      try {
        const res = await axios.post('https://port-0-planit-mcmt59q6ef387a77.sel5.cloudtype.app/api/auth/google', { code })
        const { token, name, email, phone, isExistingMember, user_id } = res.data

        // AuthStore에 로그인 정보 저장
        login({ token, name, email, phone, userId: user_id })

        localStorage.setItem('token', token)

        if (isExistingMember) {
          navigate('/main')
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
        <Hero mainpic={mainpic1} />
        <Course />
        <br />
      </div>
      <div className={styles.HotCourseContainer}></div>
      <button className={styles.chatbotButton} title="챗봇" onClick={() => setShowChatBot(true)}>
        <IoIosChatboxes />
      </button>
      {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}
    </div>
  )
}

export default MainPage
