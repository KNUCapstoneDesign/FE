// src/components/Nav.tsx
import { Link, useNavigate } from 'react-router-dom'
import styles from '../assets/Nav.module.css'
import logo from '/favicon.jpeg'
import { useAuthStore } from '../store/useAuthStore.ts'
const Nav = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0 })
  }

  const navigate = useNavigate()
  const { email, logout } = useAuthStore()
  const isLoggedIn = !!email

  const handleLogout = () => {
    logout()
    navigate('/') // 로그아웃 후 홈으로 이동
  }

  return (
    <nav className={styles.navcontainer}>
      <div className="logocontainer">
        <Link to="/" className={styles.logoLink} onClick={scrollToTop}>
          <img src={logo} alt="메인페이지로 이동" className={styles.logo} />
          <div className={styles.navTitle}>PLANIT</div>
        </Link>
      </div>

      <ul className={styles.navRight}>
        <li className={styles.navItem}>
          <Link to="/travelcourse" className={styles.navLink} onClick={scrollToTop}>
            지역별 여행 코스
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/aisearch" className={styles.navLink} onClick={scrollToTop}>
            AI 검색
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/mytravel" className={styles.navLink} onClick={scrollToTop}>
            나의 여행
          </Link>
        </li>

        {isLoggedIn ? (
          <>
            <li className={styles.navItem}>
              <Link to="/mypage" className={styles.navLink} onClick={scrollToTop}>
                마이페이지
              </Link>
            </li>
            <li className={styles.navItem}>
              <button className={styles.navLinkLogin} onClick={handleLogout}>
                로그아웃
              </button>
            </li>
          </>
        ) : (
          <>
            <li className={styles.navItem}>
              <Link to="/login" className={styles.navLinkLogin} onClick={scrollToTop}>
                로그인
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/signup" className={styles.navLinkLogin} onClick={scrollToTop}>
                회원가입
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default Nav
