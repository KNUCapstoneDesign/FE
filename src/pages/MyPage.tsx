import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import styles from '../assets/MyPage.module.css'

const MyPage = () => {
  const { name, email, phone, token, logout, hydrated } = useAuthStore()
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()


  if (!hydrated) return <div>로딩 중...</div>
  if (!token) {
    navigate('/login')
    return null
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setMessage('새 비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      await axios.post(
        'https://port-0-planit-be-mcmt59q6ef387a77.sel5.cloudtype.app/api/auth/change-password',
        { email, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setMessage('비밀번호가 성공적으로 변경되었습니다.')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      setMessage('비밀번호 변경에 실패했습니다.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className={styles.container}>
      <h2>마이페이지</h2>
      <p><strong>이름:</strong> {name}</p>
      <p><strong>이메일:</strong> {email}</p>
      <p><strong>전화번호:</strong> {phone}</p>

      <div className={styles.passwordSection}>
        <h3>비밀번호 변경</h3>
        <input
          type="password"
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
        <button onClick={handlePasswordChange}>변경</button>
        {message && <p>{message}</p>}
      </div>

      <button onClick={handleLogout} className={styles.logoutBtn}>로그아웃</button>
    </div>
  )
}

export default MyPage