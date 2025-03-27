import styles from '../assets/Hero.module.css'

interface HeroProps {
  mainpic: string
}

const Hero: React.FC<HeroProps> = ({ mainpic }) => {
  return (
    <div
      className={styles.hero}
      style={{
        backgroundImage: `url(${mainpic})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
      <h1 className={styles.heading}>어디로 떠나시나요?</h1>
      <div className={styles.searchBar}>
        <input type="text" placeholder="여행지를 입력하세요" className={styles.searchInput} />
        <button className={styles.searchBtn}>검색</button>
      </div>
    </div>
  )
}

export default Hero
