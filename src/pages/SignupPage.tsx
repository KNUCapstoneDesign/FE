import { useState } from 'react'
import styles from '../assets/SignupPage.module.css'
import axios, { AxiosError } from 'axios'


const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 이벤트 파라미터의 타입을 명시적으로 지정
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }
    // 서버로 회원가입 요청
    try {
      const response = await axios.post('https://port-0-planit-mcmt59q6ef387a77.sel5.cloudtype.app/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      })

      setSuccessMessage(response.data.message || '회원가입이 완료되었습니다.')
      setError('')
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message: string }>
      setError(axiosError.response?.data?.message || '회원가입에 실패했습니다.')
      setSuccessMessage('')
    }
  }

  return (
    <div className={styles.signupContainer}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">이름</label>
          <input
            className={styles.inputField}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">이메일</label>
          <input
            className={styles.inputField}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="phone">전화번호</label>
          <input
            className={styles.inputField}
            type="text"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호</label>
          <input
            className={styles.inputField}
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            className={styles.inputField}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
        <button type="submit" className={styles.submitButton}>가입하기</button>
      </form>
    </div>
  )
}
export default SignupPage