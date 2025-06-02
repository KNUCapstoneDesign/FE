// src/pages/SearchTest.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from '../assets/SearchTest.module.css'
import noimage from '/noimage.jpg'
import AddPlaceModal from '../components/AddPlaceModal'
import { Place } from '../store/useMyTravelStore'
import AreaSelectModal from '../components/AreaSelectModal'

interface TourItem {
  contentid: number
  firstimage?: string
  title: string
  addr1?: string
  contenttypeid: number
  readcount?: number
  mapx?: number
  mapy?: number
}

interface RawTourItem {
  contentid: string
  firstimage?: string
  title: string
  addr1?: string
  contenttypeid: string
  readcount?: string
  mapx?: string
  mapy?: string
}

const categoryList = [
  { id: '전체', label: '전체', typeIds: [] },
  { id: '관광지', label: '관광지', typeIds: [12] },
  { id: '문화시설', label: '문화시설', typeIds: [14] },
  { id: '행사/공연/축제', label: '행사/공연/축제', typeIds: [15] },
  { id: '여행코스', label: '여행코스', typeIds: [25] },
  { id: '레포츠', label: '레포츠', typeIds: [28] },
  { id: '숙박', label: '숙박', typeIds: [32] },
  { id: '쇼핑', label: '쇼핑', typeIds: [38] },
  { id: '음식점', label: '음식점', typeIds: [39] },
]

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

const SearchTest: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [submittedTerm, setSubmittedTerm] = useState('')
  const [areaCode, setAreaCode] = useState('')
  const [district, setDistrict] = useState<string>('')
  const [areaModalOpen, setAreaModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TourItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('전체')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [districtName, setDistrictName] = useState<string>('')

  const pageSize = 10
  const location = useLocation()
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_API_KEY1

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q') || ''
    const area = params.get('areaCode') || ''
    const dist = params.get('district') || ''

    setSearchTerm(q)
    setAreaCode(area)
    setDistrict(dist)
    setSubmittedTerm(q || area || dist ? q : '') // 적어도 하나라도 있으면 검색 실행
    setCurrentPage(1)
  }, [location.search])

  const fetchResults = useCallback(
    async (term: string) => {
      setLoading(true)
      setError(null)

      try {
        let url = ''

        if (term.trim()) {
          // 🔍 검색어 기반
          url = [
            `https://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}`,
            `numOfRows=1000`,
            `pageNo=1`,
            `MobileOS=ETC`,
            `MobileApp=TestApp`,
            `_type=json`,
            `keyword=${encodeURIComponent(term)}`,
            areaCode && `areaCode=${areaCode}`,
            areaCode && district && `sigunguCode=${district}`,
          ]
            .filter(Boolean)
            .join('&')
        } else {
          // 🌐 전체 지역 또는 지역 기반
          url = [
            `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${API_KEY}`,
            `numOfRows=1000`,
            `pageNo=1`,
            `MobileOS=ETC`,
            `MobileApp=TestApp`,
            `_type=json`,
            areaCode && `areaCode=${areaCode}`,
            district && `sigunguCode=${district}`,
          ]
            .filter(Boolean)
            .join('&')
        }

        const res = await fetch(url)
        const json = await res.json()
        const raw = json.response?.body?.items?.item as RawTourItem | RawTourItem[] | undefined
        const arr: RawTourItem[] = raw ? (Array.isArray(raw) ? raw : [raw]) : []

        const parsed: TourItem[] = arr.map((item) => ({
          contentid: Number(item.contentid),
          firstimage: item.firstimage,
          title: item.title,
          addr1: item.addr1,
          contenttypeid: Number(item.contenttypeid),
          readcount: item.readcount ? Number(item.readcount) : undefined,
          mapx: item.mapx ? Number(item.mapx) : undefined,
          mapy: item.mapy ? Number(item.mapy) : undefined,
        }))

        setResults(parsed)
      } catch {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    },
    [API_KEY, areaCode, district],
  )

  useEffect(() => {
    fetchResults(submittedTerm)
  }, [submittedTerm, areaCode, district, fetchResults])

  useEffect(() => {
    if (submittedTerm.trim()) {
      navigate(`/searchtest?q=${encodeURIComponent(submittedTerm)}`)
    } else {
      navigate('/searchtest')
    }
  }, [submittedTerm, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setSubmittedTerm(searchTerm)
  }

  const filtered = React.useMemo(() => {
    if (activeCategory === '전체') return results
    const { typeIds } = categoryList.find((c) => c.id === activeCategory)!
    return results.filter((item) => typeIds.includes(item.contenttypeid))
  }, [results, activeCategory])

  const renderPagination = () => {
    const totalPages = Math.ceil(filtered.length / pageSize)
    const blockSize = 10
    const blockIndex = Math.floor((currentPage - 1) / blockSize)
    const start = blockIndex * blockSize + 1
    const end = Math.min(start + blockSize - 1, totalPages)
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    return (
      <div className={styles.pagination}>
        <button className={styles.pageButton} onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          {'<<'}
        </button>
        <button className={styles.pageButton} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
          {'<'}
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => setCurrentPage(p)} className={`${styles.pageButton} ${p === currentPage ? styles.activePage : ''}`}>
            {p}
          </button>
        ))}
        <button className={styles.pageButton} onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
          {'>'}
        </button>
        <button className={styles.pageButton} onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
          {'>>'}
        </button>
      </div>
    )
  }

  return (
    <div className={styles.appContainer}>
      <header className={styles.appHeader}>
        <form onSubmit={handleSubmit} className={styles.searchBar}>
          <input type="text" className={styles.searchInput} placeholder="검색어를 입력하세요" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button type="button" className={`${styles.areaSelect} ${areaCode || district ? styles.active : ''}`} onClick={() => setAreaModalOpen(true)}>
            {areaCode ? `${AREA_LIST.find((a) => a.code === areaCode)?.name}${districtName ? ' ' + districtName : ''}` : '전체 지역'}
          </button>

          <button type="submit" className={styles.searchBtn1}>
            검색
          </button>
        </form>
        <AreaSelectModal
          open={areaModalOpen}
          onClose={() => setAreaModalOpen(false)}
          onSelect={(code, dist, distName) => {
            setAreaCode(code)
            setDistrict(dist || '')
            setDistrictName(distName || '')
            if (!searchTerm.trim()) {
              setSubmittedTerm('')
            }
          }}
          selectedAreaCode={areaCode}
          selectedDistrict={district}
        />
        <div className={styles.categoryTabs}>
          {categoryList.map((c) => (
            <button
              key={c.id}
              className={`${styles.categoryButton} ${activeCategory === c.id ? styles.active : ''}`}
              onClick={() => {
                setActiveCategory(c.id)
                setCurrentPage(1)
              }}>
              {c.label}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.resultsContainer}>
        {loading ? (
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner} />
          </div>
        ) : error ? (
          <div className={styles.noResults}>
            <h3>{error}</h3>
          </div>
        ) : filtered.length > 0 ? (
          <>
            <p className={styles.resultsCount}>{filtered.length}개의 검색결과</p>
            <div className={styles.resultsGrid}>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
                <div key={item.contentid} className={styles.resultCard} onClick={() => navigate(`/detail/${item.contentid}/${item.contenttypeid}`)}>
                  <div className={styles.resultImageWrapper}>
                    <img src={item.firstimage || noimage} alt={item.title} className={styles.resultImage} />
                    <span className={styles.categoryLabel}>
                      {{
                        12: '관광지',
                        14: '문화시설',
                        15: '행사/공연/축제',
                        25: '여행코스',
                        28: '레포츠',
                        32: '숙박',
                        38: '쇼핑',
                        39: '음식점',
                      }[item.contenttypeid] || '기타'}
                    </span>
                  </div>
                  <div className={styles.resultContent}>
                    <h3 className={styles.resultTitle}>{item.title}</h3>
                    <p className={styles.resultDescription}>{item.addr1 || '주소 정보 없음'}</p>
                  </div>
                  <button
                    className={styles.addButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPlace({
                        contentid: item.contentid,
                        contenttypeid: item.contenttypeid,
                        title: item.title,
                        firstimage: item.firstimage,
                        addr1: item.addr1,
                        mapx: item.mapx,
                        mapy: item.mapy,
                      })
                    }}>
                    일정 추가
                  </button>
                </div>
              ))}
            </div>
            {renderPagination()}
          </>
        ) : (
          <div className={styles.noResults}>
            <h3>검색 결과가 없습니다</h3>
          </div>
        )}
      </div>

      {selectedPlace && <AddPlaceModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
    </div>
  )
}

export default SearchTest
