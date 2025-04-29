// src/pages/SearchTest.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from '../assets/SearchTest.module.css'
import noimage from '/noimage.jpg'

// API 응답 아이템 타입
interface TourItem {
  contentid: number
  firstimage?: string
  title: string
  addr1?: string
  contenttypeid: number
  readcount?: number
}

// API 원시 응답 타입
interface RawTourItem {
  contentid: string
  firstimage?: string
  title: string
  addr1?: string
  contenttypeid: string
  readcount?: string
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

const SearchTest: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('') // 입력값
  const [submittedTerm, setSubmittedTerm] = useState<string>('') // 실제 검색에 쓸 값
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 10
  const [loading, setLoading] = useState<boolean>(false)
  const [results, setResults] = useState<TourItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('전체')

  const location = useLocation()
  const navigate = useNavigate()
  const API_KEY = import.meta.env.VITE_API_KEY1

  // URL(q) → searchTerm, submittedTerm 동기화
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || ''
    setSearchTerm(q)
    setSubmittedTerm(q)
    setCurrentPage(1)
  }, [location.search])

  // API 호출: 최대 1000건 한 번에 가져오기
  const fetchResults = useCallback(
    async (term: string) => {
      if (!term.trim()) {
        setResults([])
        return
      }
      setLoading(true)
      setError(null)
      try {
        const url = [
          `https://apis.data.go.kr/B551011/KorService1/searchKeyword1?serviceKey=${API_KEY}`,
          `numOfRows=1000`,
          `pageNo=1`,
          `MobileOS=ETC`,
          `MobileApp=TestApp`,
          `_type=json`,
          `keyword=${encodeURIComponent(term)}`,
        ].join('&')

        const res = await fetch(url)
        const json = await res.json()
        const raw = json.response?.body?.items?.item as RawTourItem | RawTourItem[] | undefined
        const arr: RawTourItem[] = raw ? (Array.isArray(raw) ? raw : [raw]) : []

        const parsed: TourItem[] = arr.map(({ contentid, firstimage, title, addr1, contenttypeid, readcount }) => ({
          contentid: Number(contentid),
          firstimage,
          title,
          addr1,
          contenttypeid: Number(contenttypeid),
          readcount: readcount !== undefined ? Number(readcount) : undefined,
        }))

        setResults(parsed)
      } catch {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    },
    [API_KEY],
  )

  // submittedTerm이 바뀔 때마다 전체 데이터 재로딩
  useEffect(() => {
    fetchResults(submittedTerm)
  }, [submittedTerm, fetchResults])

  // URL 동기화
  useEffect(() => {
    if (submittedTerm.trim()) {
      navigate(`/searchtest?q=${encodeURIComponent(submittedTerm)}`)
    } else {
      navigate('/searchtest')
    }
  }, [submittedTerm, navigate])

  // 검색 폼
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setSubmittedTerm(searchTerm)
  }

  // 카테고리 필터
  const filtered = React.useMemo(() => {
    if (activeCategory === '전체') return results
    const { typeIds } = categoryList.find((c) => c.id === activeCategory)!
    return results.filter((item) => typeIds.includes(item.contenttypeid))
  }, [results, activeCategory])

  // 페이지네이션 렌더
  const renderPagination = () => {
    const totalItems = filtered.length
    const totalPages = Math.ceil(totalItems / pageSize)
    if (totalPages <= 1) return null

    const blockSize = 10
    const blockIndex = Math.floor((currentPage - 1) / blockSize)
    const start = blockIndex * blockSize + 1
    const end = Math.min(start + blockSize - 1, totalPages)
    const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

    return (
      <div className={styles.pagination}>
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className={styles.pageButton}>
          {'<<'}
        </button>
        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className={styles.pageButton}>
          {'<'}
        </button>
        {pages.map((p) => (
          <button key={p} onClick={() => setCurrentPage(p)} className={`${styles.pageButton} ${p === currentPage ? styles.activePage : ''}`}>
            {p}
          </button>
        ))}
        <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={styles.pageButton}>
          {'>'}
        </button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className={styles.pageButton}>
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
                <div
                  key={item.contentid}
                  className={styles.resultCard}
                  onClick={() => navigate(`/detail/${item.contentid}/${item.contenttypeid}`)} // 클릭 시 DetailPage로 이동
                  style={{ cursor: 'pointer' }}>
                  <div className={styles.resultImageWrapper}>
                    <img src={item.firstimage || noimage} alt={item.title} className={styles.resultImage} style={{ objectFit: item.firstimage ? 'cover' : 'fill' }} />
                    <span className={styles.categoryLabel}>
                      {item.contenttypeid === 12
                        ? '관광지'
                        : item.contenttypeid === 14
                          ? '문화시설'
                          : item.contenttypeid === 15
                            ? '행사/공연/축제'
                            : item.contenttypeid === 25
                              ? '여행코스'
                              : item.contenttypeid === 28
                                ? '레포츠'
                                : item.contenttypeid === 32
                                  ? '숙박'
                                  : item.contenttypeid === 38
                                    ? '쇼핑'
                                    : item.contenttypeid === 39
                                      ? '음식점'
                                      : '기타'}
                    </span>
                  </div>
                  <div className={styles.resultContent}>
                    <h3 className={styles.resultTitle}>{item.title}</h3>
                    <p className={styles.resultDescription}>{item.addr1 || '주소 정보 없음'}</p>
                  </div>
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
    </div>
  )
}

export default SearchTest
