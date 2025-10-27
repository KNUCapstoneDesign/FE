import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from '../assets/SearchResultPage.module.css'
import noimage from '/noimage.jpg'
import AddPlaceModal from '../components/AddPlaceModal'
import { Place } from '../store/useMyTravelStore'
import AreaSelectModal from '../components/AreaSelectModal'
import CategorySelectModal from '../components/CategorySelectModal'

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

const SearchResultPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [, setSubmittedTerm] = useState('')
  const [areaCode, setAreaCode] = useState('')
  const [district, setDistrict] = useState<string>('')
  const [areaModalOpen, setAreaModalOpen] = useState(false)
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TourItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('전체')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [districtName, setDistrictName] = useState<string>('')
  const TOUR_BASE = '/api/tour'; // 프록시 사용

  // 카테고리 선택 상태
  const [cat1, setCat1] = useState('')
  const [cat2, setCat2] = useState('')
  const [cat3, setCat3] = useState('')
  const [catLabel, setCatLabel] = useState('')

  const pageSize = 12
  const location = useLocation()
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_API_KEY1

  const latestReqRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  interface FetchArgs {
    term: string
    area: string
    district: string
    l1: string
    l2: string
    l3: string
  }

  // URL 파라미터 → 상태 세팅 (카테고리 포함)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q') || ''
    const area = params.get('areaCode') || ''
    const dist = params.get('district') || ''
    const distName = params.get('districtName') || ''
    const l1 = params.get('lclsSystm1') || params.get('cat1') || ''
    const l2 = params.get('lclsSystm2') || params.get('cat2') || ''
    const l3 = params.get('lclsSystm3') || params.get('cat3') || ''
    const label = params.get('catLabel') || '' // ★ 추가

    setSearchTerm(q)
    setAreaCode(area)
    setDistrict(dist)
    setDistrictName(distName)
    setCat1(l1)
    setCat2(l2)
    setCat3(l3)
    setCatLabel(label) // ★ 추가
    setSubmittedTerm(q || area || dist || l1 || l2 || l3 ? q : '')
    setCurrentPage(1)
  }, [location.search])

  // 결과 호출 (카테고리 반영)
  const fetchResults = useCallback(
    async ({ term, area, district, l1, l2, l3 }: FetchArgs) => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
      const controller = new AbortController()
      abortRef.current = controller

      const reqId = Date.now()
      latestReqRef.current = reqId
      setLoading(true)
      setError(null)

      try {
        const baseParamsArr = [
          `serviceKey=${API_KEY}`,
          `numOfRows=1000`,
          `pageNo=1`,
          `MobileOS=ETC`,
          `MobileApp=TestApp`,
          `_type=json`,
          area && `areaCode=${area}`,
          district && `sigunguCode=${district}`,
          l1 && `lclsSystm1=${encodeURIComponent(l1)}`,
          l2 && `lclsSystm2=${encodeURIComponent(l2)}`,
          l3 && `lclsSystm3=${encodeURIComponent(l3)}`,
        ].filter(Boolean)
        const baseParams = baseParamsArr.join('&')

        let url: string
        let postFilterKeyword = ''

        if (term.trim() && (l1 || l2 || l3)) {
          url = `${TOUR_BASE}/areaBasedList2?${baseParams}`
          postFilterKeyword = term.trim()
        } else if (term.trim()) {
          url = `${TOUR_BASE}/searchKeyword2?${baseParams}&keyword=${encodeURIComponent(term.trim())}`
        } else {
          url = `${TOUR_BASE}/areaBasedList2?${baseParams}`
        }

        const res = await fetch(url, { signal: controller.signal })
        const text = await res.text()
        let json: any
        try {
          json = JSON.parse(text)
        } catch {
          throw new Error('JSON 파싱 실패')
        }

        const header = json?.response?.header
        if (header?.resultCode !== '0000') throw new Error(header?.resultMsg || 'API 오류')

        const raw = json?.response?.body?.items?.item
        const arr: any[] = raw ? (Array.isArray(raw) ? raw : [raw]) : []
        let parsed = arr.map((it) => ({
          contentid: Number(it.contentid),
          firstimage: it.firstimage,
          title: it.title,
          addr1: it.addr1,
          contenttypeid: Number(it.contenttypeid),
          readcount: it.readcount ? Number(it.readcount) : undefined,
          mapx: it.mapx ? Number(it.mapx) : undefined,
          mapy: it.mapy ? Number(it.mapy) : undefined,
        }))

        if (postFilterKeyword) {
          const kw = postFilterKeyword.toLowerCase()
          parsed = parsed.filter((p) => p.title.toLowerCase().includes(kw))
        }

        if (latestReqRef.current !== reqId) return
        setResults(parsed)
      } catch (e: any) {
        if (e.name === 'AbortError') return
        console.error('[RESULT] error', e)
        if (latestReqRef.current !== reqId) return
        setError(e.message || '데이터 로딩 실패')
        setResults([])
      } finally {
        if (latestReqRef.current === reqId) {
          setLoading(false)
        }
      }
    },
    [API_KEY],
  )

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q') || ''
    const area = params.get('areaCode') || ''
    const dist = params.get('district') || ''
    const distName = params.get('districtName') || ''
    const l1 = params.get('lclsSystm1') || params.get('cat1') || ''
    const l2 = params.get('lclsSystm2') || params.get('cat2') || ''
    const l3 = params.get('lclsSystm3') || params.get('cat3') || ''
    const label = params.get('catLabel') || ''

    setSearchTerm(q)
    setAreaCode(area)
    setDistrict(dist)
    setDistrictName(distName)
    setCat1(l1)
    setCat2(l2)
    setCat3(l3)
    setCatLabel(label)
    setCurrentPage(1)

    if (q.trim() || area || dist || l1 || l2 || l3) {
      fetchResults({ term: q, area, district: dist, l1, l2, l3 })
    } else {
      setResults([])
      setError(null)
    }
  }, [location.search, fetchResults])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    const params = new URLSearchParams()
    if (searchTerm.trim()) params.append('q', searchTerm.trim())
    if (areaCode) params.append('areaCode', areaCode)
    if (district) params.append('district', district)
    if (districtName) params.append('districtName', districtName)
    if (cat1) params.append('lclsSystm1', cat1)
    if (cat2) params.append('lclsSystm2', cat2)
    if (cat3) params.append('lclsSystm3', cat3)
    if (catLabel) params.append('catLabel', catLabel) // ★ 추가
    navigate(`/searchresult?${params.toString()}`)
  }

  const filtered = useMemo(() => {
    const base = results
    if (activeCategory === '전체') return base
    const { typeIds } = categoryList.find((c) => c.id === activeCategory)!
    return base.filter((item) => typeIds.includes(item.contenttypeid))
  }, [results, activeCategory /*, categoryFiltered*/])

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
        <button className={`${styles.pageButton} ${currentPage === 1 ? styles.disabled : ''}`} onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
          {'<'}
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => setCurrentPage(p)} className={`${styles.pageButton} ${p === currentPage ? styles.activePage : ''}`}>
            {p}
          </button>
        ))}
        <button
          className={`${styles.pageButton} ${currentPage === totalPages ? styles.disabled : ''}`}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}>
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
          <input type="text" className={styles.searchInput} placeholder="어디로 떠나고 싶으신가요?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

          <button type="button" className={`${styles.areaSelect} ${areaCode || district ? styles.active : ''}`} onClick={() => setAreaModalOpen(true)}>
            {areaCode ? `${AREA_LIST.find((a) => a.code === areaCode)?.name}${districtName ? ' ' + districtName : ''}` : '지역 선택'}
          </button>

          <button type="button" className={`${styles.areaSelect} ${cat1 ? styles.active : ''}`} onClick={() => setCatModalOpen(true)}>
            {catLabel || '카테고리'}
          </button>

          <button type="submit" className={styles.searchBtn1}>
            검색
          </button>
        </form>

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

      <AreaSelectModal
        open={areaModalOpen}
        onClose={() => setAreaModalOpen(false)}
        onSelect={(code, dist, distName) => {
          setAreaCode(code)
          setDistrict(dist || '')
          setDistrictName(distName || '')
          const params = new URLSearchParams()
          if (searchTerm.trim()) params.append('q', searchTerm.trim())
          if (code) params.append('areaCode', code)
          if (dist) params.append('district', dist)
          if (distName) params.append('districtName', distName)
          if (cat1) params.append('lclsSystm1', cat1)
          if (cat2) params.append('lclsSystm2', cat2)
          if (cat3) params.append('lclsSystm3', cat3)
          if (catLabel) params.append('catLabel', catLabel) // ★ 추가
          navigate(`/searchresult?${params.toString()}`, { replace: true })
        }}
        selectedAreaCode={areaCode}
        selectedDistrict={district}
      />

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
          const params = new URLSearchParams(location.search)
          ;['lclsSystm1', 'lclsSystm2', 'lclsSystm3', 'catLabel'].forEach((k) => params.delete(k)) // ★ catLabel 삭제 추가
          if (c1) params.set('lclsSystm1', c1)
          if (c2) params.set('lclsSystm2', c2)
          if (c3) params.set('lclsSystm3', c3)
          if (label) params.set('catLabel', label) // ★ 추가
          navigate(`/searchresult?${params.toString()}`, { replace: true })
        }}
      />

      <main className={styles.resultsContainer}>
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
            <p className={styles.resultsCount}>{filtered.length}개의 검색결과를 찾았어요!</p>
            <div className={styles.resultsGrid}>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((item) => (
                <div key={item.contentid} className={styles.resultCard} onClick={() => navigate(`/detail/${item.contentid}/${item.contenttypeid}`)}>
                  <div className={styles.resultImageWrapper}>
                    <img src={item.firstimage || noimage} alt={item.title} className={styles.resultImage} />
                  </div>
                  <span className={styles.categoryLabel}>
                    {{ 12: '관광지', 14: '문화시설', 15: '행사/공연/축제', 25: '여행코스', 28: '레포츠', 32: '숙박', 38: '쇼핑', 39: '음식점' }[item.contenttypeid] || '기타'}
                  </span>
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
            <h3>검색 결과가 없습니다.</h3>
          </div>
        )}
      </main>

      {selectedPlace && <AddPlaceModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
    </div>
  )
}

export default SearchResultPage
