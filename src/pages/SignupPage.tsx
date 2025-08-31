import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../assets/SignupPage.module.css'
import axios, { AxiosError } from 'axios'

const SignupPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      setSuccessMessage('')
      return
    }
    try {
      const response = await axios.post('https://port-0-planit-mcmt59q6ef387a77.sel5.cloudtype.app/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      })
      setSuccessMessage(response.data.message || '회원가입이 완료되었습니다.')
      setError('')
      setTimeout(() => navigate('/login'), 1200)
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>
      setError(axiosError.response?.data?.message || '회원가입에 실패했습니다.')
      setSuccessMessage('')
    }
  }

  const goLogin = () => navigate('/login')

  return (
    <div className={styles.container}>
      {/* 토글 패널 (왼쪽) */}
      <div className={styles['toggle-container']}>
        <div className={styles.toggle}>
          <div className={`${styles['toggle-panel']} ${styles['toggle-left']}`}>
            <h1>Welcome Back!</h1>
            <p className={styles.welcome}>이미 계정이 있다면 로그인으로 이동하세요!</p>
            <button className={styles.hidden} onClick={goLogin}>
              로그인
            </button>
          </div>
        </div>
      </div>

      {/* 회원가입 폼 (오른쪽) */}
      <div className={`${styles['form-container']} ${styles['sign-up']}`}>
        <form onSubmit={handleSubmit} className={styles.signupform}>
          <h1>계정 생성</h1>
          <span>당신의 이메일로 가입해주세요!</span>
          <input type="text" name="name" placeholder="성명" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="이메일" autoComplete="email" value={formData.email} onChange={handleChange} required />
          <input type="text" name="phone" placeholder="전화번호" value={formData.phone} onChange={handleChange} required />
          <input type="password" name="password" placeholder="비밀번호" autoComplete="new-password" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="비밀번호 확인" autoComplete="new-password" value={formData.confirmPassword} onChange={handleChange} required />
          {error && <p className={styles.error}>{error}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}
          <button type="submit">회원가입</button>
        </form>
      </div>
    </div>
  )
}

export default SignupPage
