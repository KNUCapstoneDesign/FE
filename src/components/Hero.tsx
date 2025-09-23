import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../assets/Hero.module.css'
import AreaSelectModal from './AreaSelectModal' // 모달 컴포넌트 import
import FlickerText from './FlickerText.tsx'
import CategorySelectModal from './CategorySelectModal'

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

  // 카테고리 선택 상태 (추가)
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [cat1, setCat1] = useState('')
  const [cat2, setCat2] = useState('')
  const [cat3, setCat3] = useState('')
  const [catLabel, setCatLabel] = useState('')
  const API_KEY = import.meta.env.VITE_API_KEY1

  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.append('q', searchTerm.trim())
    if (areaCode) params.append('areaCode', areaCode)
    if (district) params.append('district', district)
    if (districtName) params.append('districtName', districtName)
    if (cat1) {
      params.append('lclsSystm1', cat1)
      params.append('cat1', cat1)
    }
    if (cat2) {
      params.append('lclsSystm2', cat2)
      params.append('cat2', cat2)
    }
    if (cat3) {
      params.append('lclsSystm3', cat3)
      params.append('cat3', cat3)
    }
    if (catLabel) params.append('catLabel', catLabel) // ★ 추가
    navigate(`/searchresult?${params.toString()}`)
    window.scrollTo({ top: 0 })
  }

  return (
    <div
      className={styles.hero}
      style={{
        backgroundImage: `url(${mainpic})`,
        backgroundPosition: 'center',
        height: '80vh',
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
          fontSize: '3.5rem',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
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
          {areaCode ? `${AREA_LIST.find((a) => a.code === areaCode)?.name}${districtName ? ' ' + districtName : ''}` : '지역 선택'}
        </button>

        {/* 카테고리 버튼 (추가) */}
        <button type="button" className={`${styles.areaSelect} ${cat1 ? styles.active : ''}`} onClick={() => setCatModalOpen(true)}>
          {catLabel || '카테고리'}
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

      {/* 카테고리 모달 (추가) */}
      <CategorySelectModal
        open={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        apiKey={API_KEY}
        selectedCat1={cat1}
        selectedCat2={cat2}
        selectedCat3={cat3}
        onSelect={(c1, c2, c3, label) => {
          setCat1(c1)
          setCat2(c2)
          setCat3(c3)
          setCatLabel(label)
          setCatModalOpen(false)
        }}
      />
    </div>
  )
}

export default Hero
