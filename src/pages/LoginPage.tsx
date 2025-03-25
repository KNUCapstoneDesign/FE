// src/pages/LoginPage.tsx
import React, { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import styles from '../assets/LoginPage.module.css'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useAuthStore((state) => state.login)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // JWT 토큰을 받아서 로그인 상태 설정
    login('dummy-jwt-token') // 이 부분은 실제 API 호출로 대체해야 합니다.
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.loginContainer}>
        <div>
          <h1>Login</h1>
        </div>
        <div>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={function(){}}>Login</button>
        </div>
        <div>
          <a href="/signup">회원가입
          </a>
        </div>
      
      </div>
    </form>
  )
}

export default LoginPage
