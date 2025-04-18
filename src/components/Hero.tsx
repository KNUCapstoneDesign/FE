import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../assets/Hero.module.css'

interface HeroProps {
  mainpic: string
}

const Hero: React.FC<HeroProps> = ({ mainpic }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/searchtest?q=${encodeURIComponent(searchTerm)}`)
    } else {
      navigate('/searchtest')
    }
  }

  return (
    <div
      className={styles.hero}
      style={{
        backgroundImage: `url(${mainpic})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      <h1 className={styles.heading}>어디로 떠나시나요?</h1>
      <form onSubmit={handleSubmit} className={styles.searchBar}>
        <input type="text" placeholder="여행지를 입력하세요" className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <button type="submit" className={styles.searchBtn}>
          검색
        </button>
      </form>
    </div>
  )
}

export default Hero
