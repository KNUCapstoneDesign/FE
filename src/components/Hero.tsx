import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../assets/Hero.module.css'
import AreaSelectModal from './AreaSelectModal' // 모달 컴포넌트 import

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

    navigate(`/searchtest?${params.toString()}`)
    window.scrollTo({ top: 0 })
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

        <button type="button" className={`${styles.areaSelect} ${areaCode || district ? styles.active : ''}`} onClick={() => setModalOpen(true)}>
          {areaCode ? `${AREA_LIST.find((a) => a.code === areaCode)?.name}${districtName ? ' ' + districtName : ''}` : '전체 지역'}
        </button>

        <button type="submit" className={styles.searchBtn}>
          검색
        </button>
      </form>

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
