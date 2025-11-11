import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import styles from '../assets/MyPage.module.css'
import MainLoading from '../components/MainLoading'

const MyPage = () => {
  const { name, email, phone, token, hydrated } = useAuthStore() // logout 제거
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  if (!hydrated) return <MainLoading/>
  if (!token) {
    navigate('/login')
    return null
  }

  const handlePasswordChange = async () => {
    if (!newPassword || !confirmNewPassword) {
      setMessage('모든 비밀번호 입력란을 채워주세요.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setMessage('새 비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      setLoading(true)
      await axios.post('https://port-0-planit-mcmt59q6ef387a77.sel5.cloudtype.app/api/auth/change-password', { email, newPassword }, { headers: { Authorization: `Bearer ${token}` } })
      setMessage('비밀번호가 성공적으로 변경되었습니다.')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)
      setMessage('비밀번호 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card} data-aos="fade-up" data-aos-duration="700" data-aos-easing="ease-out-cubic">
        <header className={`${styles.header} ${styles.headerSingle}`}>
          <h2 className={styles.title}>마이페이지</h2>
        </header>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>내 정보</h3>
          <div className={styles.infoList}>
            <div className={styles.infoRow}>
              <span className={styles.fieldLabel}>이름</span>
              <span className={styles.fieldValue}>{name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.fieldLabel}>이메일</span>
              <span className={styles.fieldValue}>{email}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.fieldLabel}>전화번호</span>
              <span className={styles.fieldValue}>{phone}</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>비밀번호 변경</h3>
          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>새 비밀번호</label>
            <input type="password" className={styles.input} placeholder="새 비밀번호" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.inputLabel}>새 비밀번호 확인</label>
            <input type="password" className={styles.input} placeholder="새 비밀번호 확인" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
          </div>
          <button onClick={handlePasswordChange} className={styles.primaryBtn} disabled={loading}>
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>
          {message && <p className={message.includes('성공') ? `${styles.message} ${styles.success}` : `${styles.message} ${styles.error}`}>{message}</p>}
        </section>
      </div>
    </div>
  )
}

export default MyPage
