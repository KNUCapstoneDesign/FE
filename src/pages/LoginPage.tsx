import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import styles from '../assets/LoginPage.module.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import GoogleLoginButton from '../components/GoogleLoginButton.tsx'

const LoginPage = () => {
  // 회원가입 관련 state 제거
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('https://port-0-planit-mcmt59q6ef387a77.sel5.cloudtype.app/api/auth/login', { email, password })
      const { user_id, name, token, phone } = response.data
      login({ userId: user_id, name, token, email, phone })
      navigate('/main')
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
    }
  }

  // Sign Up 버튼 -> /signup 이동
  const goSignup = () => {
    navigate('/signup')
  }

  return (
    <div className={styles.container}>
      {/* 로그인 폼 */}
      <div className={`${styles['form-container']} ${styles['sign-in']}`}>
        <form onSubmit={handleSignIn}>
          <h1>Sign In</h1>
          <div className={styles['social-icons']}>
            <GoogleLoginButton />
          </div>
          <span>또는 이메일로 로그인</span>
          <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <a href="#">비밀번호를 잊어버렸나요?</a>
          <button type="submit">로그인</button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>

      {/* 토글 패널 - Sign Up 버튼만 사용 */}
      <div className={styles['toggle-container']}>
        <div className={styles.toggle}>
          <div className={`${styles['toggle-panel']} ${styles['toggle-left']}`}>
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use all of site features</p>
            <button className={styles.hidden}>로그인</button>
          </div>
          <div className={`${styles['toggle-panel']} ${styles['toggle-right']}`}>
            <h1>Welcome!</h1>
            <p>사이트의 모든 기능을 이용하려면 회원가입을 진행해주세요!</p>
            <button className={styles.hidden} onClick={goSignup}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
