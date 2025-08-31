import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../assets/Hero.module.css'
import AreaSelectModal from './AreaSelectModal' // 모달 컴포넌트 import
import FlickerText from './FlickerText.tsx'

const AREA_LIST = [
  { code: '', name: '전체 지역' },
  { code: '1', name: '서울' },
  { code: '2', name: '인천' },
  { code: '3', name: '대전' },
  { code: '4', name: '대구' },
  { code: '5', name: '광주' },
  { code: '6', name: '부산' },
  { code: '7', name: '울산' },
  { code: '8', name: '세종' },
  { code: '31', name: '경기' },
  { code: '32', name: '강원' },
  { code: '33', name: '충북' },
  { code: '34', name: '충남' },
  { code: '35', name: '경북' },
  { code: '36', name: '경남' },
  { code: '37', name: '전북' },
  { code: '38', name: '전남' },
  { code: '39', name: '제주' },
]

interface HeroProps {
  mainpic: string
}

const Hero: React.FC<HeroProps> = ({ mainpic }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [areaCode, setAreaCode] = useState('')
  const [district, setDistrict] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchTerm.trim()) params.append('q', searchTerm.trim())
    if (areaCode) params.append('areaCode', areaCode)
    if (district) params.append('district', district)
    if (districtName) params.append('districtName', districtName)

    navigate(`/searchresult?${params.toString()}`)
    window.scrollTo({ top: 0 })
  }

  return (
    <div
      className={styles.hero}
      style={{
        backgroundImage: `url(${mainpic})`,
        backgroundPosition: 'center',
        height: '80vh', // 높이 조정
        backgroundSize: 'cover',
      }}>
      <FlickerText
        text="어디로 떠나시나요?"
        textColor="#fffcfa"
        glowColor="#d8e1f2"
        //#ede7ca
        //#d8e1f2
        showBackground={false}
        font={{
          fontSize: "3.5rem",
          fontWeight: "bold",
          letterSpacing: "0.1em",
          fontFamily:
            "'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
        }}
        animationSpeed={1.2}
        animationPattern="random"
        animationStyle="neon"
        strokeWidth={1}
        glowIntensity={12}
        // 💡 [중요] 이 속성을 'once'로 설정하여 한 번만 재생하고 멈추도록 합니다.
        repeatBehavior="loop"
      />

      <form onSubmit={handleSubmit} className={styles.searchBar}>
        <input type="text" placeholder="장소를 입력하세요" className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

        <button type="button" className={`${styles.areaSelect} ${areaCode || district ? styles.active : ''}`} onClick={() => setModalOpen(true)}>
          {areaCode ? `${AREA_LIST.find((a) => a.code === areaCode)?.name}${districtName ? ' ' + districtName : ''}` : '전체 지역'}
        </button>

        <button type="submit" className={styles.searchBtn}>
          검색
        </button>
      </form>

      {/*<TrueFocus*/}
      {/*  text="서울 인천 대전 대구 광주 부산 울산 세종 경기도 강원도 | 충청북도 충청남도 경상북도 경상남도 전라북도 전라남도 제주"*/}
      {/*  manualMode={false} // 자동으로 애니메이션 실행*/}
      {/*  blurAmount={4}*/}
      {/*  randomOrder={true}*/}
      {/*  borderColor="white"*/}
      {/*  glowColor="rgba(255, 255, 255, 0.6)"*/}
      {/*  animationDuration={0.7}*/}
      {/*  pauseBetweenAnimations={1.2}*/}
      {/*  textColor="#FFFFFF"*/}
      {/*  font={{*/}
      {/*    fontSize: "42px",*/}
      {/*    fontWeight: "700",*/}
      {/*    textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",*/}
      {/*  }}*/}
      {/*/>*/}

      <AreaSelectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(code, dist, distName) => {
          setAreaCode(code)
          setDistrict(dist || '')
          setDistrictName(distName || '')
        }}
        selectedAreaCode={areaCode}
        selectedDistrict={district}
      />
    </div>
  )
}

export default Hero
