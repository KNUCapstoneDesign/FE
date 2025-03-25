// src/components/Nav.tsx
import { Link } from 'react-router-dom'
import styles from '../assets/Nav.module.css'
import logo from '/favicon.jpeg'

const Nav = () => {
  return (
    <nav className={styles.navcontainer}>
      <div className="logocontainer">
        <Link to="/" className={styles.logoLink}>
          <img src={logo} alt="메인페이지로 이동" className={styles.logo} />
          <div className={styles.navTitle}>CAPSTONE DESIGN</div>
        </Link>
      </div>

      <ul className={styles.navRight}>
        <li className={styles.navItem}>
          <Link to="/travelcourse" className={styles.navLink}>
            지역별 여행 코스
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/aisearch" className={styles.navLink}>
            AI 검색
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/mytravel" className={styles.navLink}>
            나의 여행
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/mypage" className={styles.navLink}>
            마이페이지
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/login" className={styles.navLinkLogin}>
            로그인
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/signup" className={styles.navLinkLogin}>
            회원가입
          </Link>
        </li>
      </ul>
    </nav>
  )
}

export default Nav
