import { Link, useNavigate } from 'react-router-dom'
import styles from '../assets/Nav.module.css'
import logo from '/logo.png'
import { useAuthStore } from '../store/useAuthStore.ts'
import { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { IoClose } from 'react-icons/io5' // ❌ X 아이콘

const Nav = () => {
  const scrollToTop = () => window.scrollTo({ top: 0 })

  const navigate = useNavigate()
  const { isAuthenticated, logout, hydrated } = useAuthStore()

  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  if (!hydrated) return null

  const handleLogout = () => {
    logout()
    navigate('/main')
  }

  const handleSearchToggle = () => {
    if (showSearch && searchTerm.trim()) {
      navigate(`/searchtest?q=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
    }
    setShowSearch((prev) => !prev)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/searchtest?q=${encodeURIComponent(searchTerm.trim())}`)
      setSearchTerm('')
      setShowSearch(false)
    }
  }

  return (
    <nav className={styles.navcontainer}>
      <div className="logocontainer">
        <Link to="/main" className={styles.logoLink} onClick={scrollToTop}>
          <img src={logo} alt="메인페이지로 이동" className={styles.logo} />
        </Link>
      </div>

      <ul className={styles.navRight}>
        {/* 🔍 검색 영역 */}
        <li className={styles.navItem} style={{ position: 'relative' }}>
          <div className={styles.searchWrapper}>
            {showSearch && (
              <div className={styles.searchBox}>
                <input
                  type="text"
                  className={styles.navSearchInput}
                  placeholder="검색어 입력"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  autoFocus
                />
                <IoClose
                  className={styles.closeIcon}
                  onClick={() => {
                    setSearchTerm('')
                    setShowSearch(false)
                  }}
                />
              </div>
            )}
            <FaSearch onClick={handleSearchToggle} className={styles.searchIcon} title="검색" />
          </div>
        </li>

        {/* 기존 메뉴 */}
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

        {isAuthenticated ? (
          <>
            <li className={styles.navItem}>
              <Link to="/mypage" className={styles.navLink} onClick={scrollToTop}>
                마이페이지
              </Link>
            </li>
            <li className={styles.navItem}>
              <div style={{ height: '32.6px', paddingTop: '14px' }} className={styles.navLink} onClick={handleLogout}>
                로그아웃
              </div>
            </li>
          </>
        ) : (
          <>
            <li className={styles.navItem}>
              <Link to="/login" className={styles.navLink} onClick={scrollToTop}>
                로그인
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/signup" className={styles.navLink} onClick={scrollToTop}>
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
