// src/pages/AiSearchPage.tsx
import React, { useRef, DragEvent, useEffect, useState } from 'react'
import styles from '../assets/AiSearchPage.module.css'
import { readFileAsBase64 } from '../utils/imageToBase64'
import { analyzeImageWithVisionAPI } from '../utils/visionApi'
import { translateToKoreanWithGoogle } from '../utils/translate'
import { useAiSearchStore } from '../store/AiSearchStore'
import { Place } from '../store/useMyTravelStore'
import AddPlaceModal from '../components/AddPlaceModal'
import AreaSelectModal from '../components/AreaSelectModal'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const NAVER_SCRIPT_ID = 'naver-map-script'

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

const AiSearchPage: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<naver.maps.Map>(null)
  const markerInstance = useRef<naver.maps.Marker>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLocation, setSelectedLocation] = useState<{ mapx: number; mapy: number } | null>(null)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [naverReady, setNaverReady] = useState(false)

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false)
  const [selectedAreaCode, setSelectedAreaCode] = useState<string>('')
  const [selectedSigunguCode, setSelectedSigunguCode] = useState<string | undefined>(undefined)
  const [selectedSigunguName, setSelectedSigunguName] = useState<string | undefined>(undefined)

  const distanceLabelMarker = useRef<naver.maps.Marker | null>(null)
  const fetchAbortRef = useRef<AbortController | null>(null)

  const itemsPerPage = 5
  const PAGE_BLOCK = 10
  const { tab, imageUrl, labels, selectedLabel, results, setTab, setImageUrl, setLabels, setSelectedLabel, setResults, reset } = useAiSearchStore()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const selectedAreaName = React.useMemo(() => AREA_LIST.find((a) => a.code === selectedAreaCode)?.name || '', [selectedAreaCode])
  
  const regionButtonLabel = React.useMemo(() => {
    if (selectedAreaName && selectedSigunguName) return `${selectedAreaName} > ${selectedSigunguName}`
    if (selectedAreaName) return selectedAreaName
    return '지역 필터'
  }, [selectedAreaName, selectedSigunguName])

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (window.naver?.maps) {
      setNaverReady(true)
      return
    }
    if (!document.getElementById(NAVER_SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = NAVER_SCRIPT_ID
      script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}`
      script.async = true
      script.onload = () => setNaverReady(true)
      document.head.appendChild(script)
    } else {
      const timer = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(timer)
          setNaverReady(true)
        }
      }, 100)
    }
  }, [])

  useEffect(() => {
    if (!naverReady || !selectedLocation || !mapRef.current) return
    const { mapx, mapy } = selectedLocation
    const placeLocation = new window.naver.maps.LatLng(mapy, mapx)

    const initializeMap = (myLocation?: naver.maps.LatLng) => {
      const bounds = new window.naver.maps.LatLngBounds()
      bounds.extend(placeLocation)
      if (myLocation) {
        bounds.extend(myLocation)
      }

      const map = new window.naver.maps.Map(mapRef.current!, {
        center: myLocation ? bounds.getCenter() : placeLocation,
        zoom: 10,
      })
      mapInstance.current = map

      new window.naver.maps.Marker({ position: placeLocation, map, title: '장소 위치' })

      if (myLocation) {
        new window.naver.maps.Marker({ position: myLocation, map, title: '내 위치' })
        new window.naver.maps.Polyline({
          map: map,
          path: [placeLocation, myLocation],
          strokeColor: '#5347AA',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          zIndex: 10,
        })

        window.naver.maps.Event.once(map, 'idle', () => {
          map.fitBounds(bounds, { padding: 50 })
        })

        const projection = map.getProjection()
        const calculatedDistance = projection.getDistance(placeLocation, myLocation)
        setDistance(calculatedDistance)

        const midPoint = new window.naver.maps.LatLng((placeLocation.y + myLocation.y) / 2, (placeLocation.x + myLocation.x) / 2)
        const distanceText = `${(calculatedDistance / 1000).toFixed(2)}km`

        distanceLabelMarker.current = new window.naver.maps.Marker({
          position: midPoint,
          map: map,
          icon: {
            content: `
              <div style="
                position: relative;
                transform: translate(-50%, -100%);
                padding: 2px 8px;
                background-color: white;
                border: 1px solid #5347AA;
                border-radius: 10px;
                color: #5347AA;
                font-size: 14px;
                font-weight: bold;
                white-space: nowrap;
              ">
                ${distanceText}
              </div>
            `,
          },
        })
      } else {
        setDistance(null)
        map.setCenter(placeLocation)
        map.setZoom(14)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const myLocation = new window.naver.maps.LatLng(position.coords.latitude, position.coords.longitude)
          initializeMap(myLocation)
        },
        () => {
          console.error('Error getting current location: Geolocation failed.')
          initializeMap()
        },
      )
    } else {
      console.log('Geolocation is not supported by this browser.')
      initializeMap()
    }

    const handleResize = () => (mapInstance.current as any)?.relayout?.()
    window.addEventListener('resize', handleResize)

    const observer = new window.MutationObserver(() => {
      ;(mapInstance.current as any)?.relayout?.()
    })
    if (mapRef.current) {
      observer.observe(mapRef.current, { attributes: true, childList: true, subtree: true })
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      if (distanceLabelMarker.current) {
        distanceLabelMarker.current.setMap(null)
      }
    }
  }, [selectedLocation, naverReady])

  const handleImageUpload = async (file: File) => {
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('파일 크기는 최대 10MB까지 허용됩니다.')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setImageUrl(reader.result as string)
    reader.readAsDataURL(file)

    try {
      const base64 = await readFileAsBase64(file)
      const visionLabels = await analyzeImageWithVisionAPI(base64)
      const translatedLabels = await translateToKoreanWithGoogle(visionLabels)
      setLabels(translatedLabels)
    } catch (error) {
      console.error('❌ Vision/Translation/Search 오류:', error)
    }
  }

  const handleLabelClick = async (label: string) => {
    setSelectedLabel(label)
    setCurrentPage(1)
  }

  const handleTabChange = (newTab: 'restaurant' | 'tour') => {
    setTab(newTab)
    setImageUrl(null)
    setLabels([])
    setResults([])
    setSelectedLabel(null)
    setCurrentPage(1)
    setSelectedLocation(null)
    setSelectedCardId(null)
    markerInstance.current?.setMap(null)
    mapInstance.current = null
  }

  const triggerFileInput = () => inputRef.current?.click()
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
  }
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleImageUpload(file)
  }

  // 필터 적용 결과 계산
  const displayResults = React.useMemo(() => {
    if (!results || results.length === 0) return []
    return results.filter((it) => {
      const item: any = it as any
      // 지역 필터
      if (selectedAreaCode) {
        const areaMatched = (item.areacode && String(item.areacode) === String(selectedAreaCode)) || (item.addr1 && String(item.addr1).includes(selectedSigunguName || ''))
        if (!areaMatched) return false
      }
      if (selectedSigunguCode) {
        const sigunguMatched = (item.sigungucode && String(item.sigungucode) === String(selectedSigunguCode)) || (item.addr1 && String(item.addr1).includes(selectedSigunguName || ''))
        if (!sigunguMatched) return false
      }
      return true
    })
  }, [results, selectedAreaCode, selectedSigunguCode, selectedSigunguName])

  // 필터 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedAreaCode, selectedSigunguCode])

  const totalPages = Math.ceil(displayResults.length / itemsPerPage)
  const currentBlock = Math.floor((currentPage - 1) / PAGE_BLOCK)
  const blockstart = currentBlock * PAGE_BLOCK + 1
  const blockEnd = Math.min(blockstart + PAGE_BLOCK - 1, totalPages)

  const handleFirstPage = () => setCurrentPage(1)
  const handleLastPage = () => setCurrentPage(totalPages)
  const handlePrevBlock = () => setCurrentPage(Math.max(1, blockstart - PAGE_BLOCK))
  const handleNextBlock = () => setCurrentPage(Math.min(totalPages, blockEnd + 1))

  const paginatedResults = displayResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // 선택 라벨/필터 변경 시 서버에 맞춰 재조회
  useEffect(() => {
    const label = selectedLabel?.trim() || ''
    const hasArea = !!(selectedAreaCode || selectedSigunguCode)

    // 조건이 하나도 없으면 초기화만
    if (!label && !hasArea) {
      setResults([])
      return
    }

    // 중복 요청 취소
    if (fetchAbortRef.current) fetchAbortRef.current.abort()
    const controller = new AbortController()
    fetchAbortRef.current = controller

    const API_KEY = import.meta.env.VITE_API_KEY1 as string
    const TOUR_BASE = '/api/tour'
    const params: string[] = [
      `serviceKey=${API_KEY}`,
      'MobileOS=ETC',
      'MobileApp=PlanIt',
      '_type=json',
      'pageNo=1',
      'numOfRows=1000',
    ]
    const contentTypeId = tab === 'restaurant' ? '39' : '12'
    if (contentTypeId) params.push(`contentTypeId=${contentTypeId}`)
    if (selectedAreaCode) params.push(`areaCode=${encodeURIComponent(selectedAreaCode)}`)
    if (selectedSigunguCode) params.push(`sigunguCode=${encodeURIComponent(selectedSigunguCode)}`)

    // 엔드포인트 결정
    let endpoint = ''
    let postFilterKeyword = ''
    if (label && hasArea) {
      endpoint = 'areaBasedList2'
      postFilterKeyword = label
    } else if (label) {
      endpoint = 'searchKeyword2'
      params.push(`keyword=${encodeURIComponent(label)}`)
    } else {
      endpoint = 'areaBasedList2'
    }

    const url = `${TOUR_BASE}/${endpoint}?${params.join('&')}`

    ;(async () => {
      try {
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
          mapx: it.mapx ? Number(it.mapx) : undefined,
          mapy: it.mapy ? Number(it.mapy) : undefined,
          // 원시 코드가 포함되면 보존 (클라이언트 필터 보조)
          areacode: it.areacode,
          sigungucode: it.sigungucode,
        })) as any

        if (postFilterKeyword) {
          const kw = postFilterKeyword.toLowerCase()
          parsed = parsed.filter((p: any) => (p.title || '').toLowerCase().includes(kw))
        }

        setResults(parsed)
      } catch (e) {
        if ((e as any).name === 'AbortError') return
        console.error('[AI Search] 결과 로딩 실패:', e)
        // 실패 시 기존 결과 유지 (UX)
      }
    })()

    return () => controller.abort()
  }, [selectedLabel, selectedAreaCode, selectedSigunguCode, tab, setResults])

  useEffect(() => {
    if (!isAuthenticated) {
      alert('로그인 후 이용 가능합니다.')
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <h1 className={styles.title} data-aos="fade-up" data-aos-duration="700" data-aos-easing="ease-out-cubic">이미지로 검색하기</h1>
        <p className={styles.subtitle} data-aos="fade-up" data-aos-delay="80">음식이나 관광지 사진을 업로드하여 관련 정보를 찾아보세요!</p>
        <p className={styles.subtitle2} data-aos="fade-up" data-aos-delay="120">※ AI가 이미지를 판별하기 때문에 정확하지 않을 수 있습니다.</p>

        <div className={styles.tabButtons} data-aos="fade-up" data-aos-delay="160">
          <button className={`${styles.tabButton} ${tab === 'restaurant' ? styles.active : ''}`} onClick={() => handleTabChange('restaurant')}>
            음식점
          </button>
          <button className={`${styles.tabButton} ${tab === 'tour' ? styles.active : ''}`} onClick={() => handleTabChange('tour')}>
            관광지
          </button>
        </div>

        {!imageUrl && (
          <div
            className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''}`}
            onClick={triggerFileInput}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-aos="fade-up"
            data-aos-delay="220"
          >
            <div className={styles.uploadText}>이미지 업로드 또는 여기에 드래그하세요</div>
            <input type="file" ref={inputRef} accept="image/*" onChange={handleFileChange} className={styles.uploadInput} />
          </div>
        )}
        {imageUrl && (
          <div className={styles.previewImageWrapper} data-aos="fade-up" data-aos-delay="220">
            <img src={imageUrl} alt="미리보기" className={styles.previewImage} style={{ pointerEvents: 'none' }} />
          </div>
        )}

        {labels.length > 0 && (
          <div className={styles.labels} data-aos="fade-up" data-aos-delay="240">
            <h3 className={styles.labelh3}>🔍 분석 결과</h3>
            <p className={styles.labelp}>※ 검색어로 사용할 장소명 키워드를 선택해주세요!</p>
            <div className={styles.labelList}>
              {labels.map((label, idx) => (
                <button key={idx} onClick={() => handleLabelClick(label)} className={`${styles.labelItem} ${selectedLabel === label ? styles.labelItemSelected : ''}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedLabel && (
          <div className={styles.resultArea}>
            <div className={styles.resultList} data-aos="fade-up" data-aos-delay="80">
              <div className={styles.resultHeaderRow}>
                <h2 className={styles.resulth2}>
                  {selectedLabel ? `"${selectedLabel}" 검색 결과` : '검색 결과'}
                  <span className={styles.resultCount}>{displayResults.length}개의 검색결과</span>
                </h2>
                <div className={styles.filterBar}>
                  <div className={styles.filterBtns}>
                    <button 
                      className={`${styles.filterBtn} ${(selectedAreaCode || selectedSigunguCode) ? styles.filterBtnActive : ''}`} 
                      onClick={() => setIsAreaModalOpen(true)}
                    >
                      {regionButtonLabel}
                    </button>
                  </div>
                </div>
              </div>
              {paginatedResults.map((item) => (
                <div
                  key={item.contentid}
                  className={`${styles.resultCard} ${selectedCardId === String(item.contentid) ? styles.resultCardSelected : ''}`}
                  onClick={() => {
                    if (item.mapx && item.mapy) setSelectedLocation({ mapx: item.mapx, mapy: item.mapy })
                    setSelectedCardId(String(item.contentid))
                  }}>
                  <img src={item.firstimage || '/noimage.jpg'} alt={item.title} className={styles.resultImage} />
                  <div className={styles.resultInfo}>
                    <div className={styles.resultTextGroup}>
                      <div className={styles.resulttitle}>{item.title}</div>
                      <div className={styles.resultaddr}>{item.addr1 || '주소 정보 없음'}</div>
                    </div>
                    <div>
                      <button
                        className={styles.detailButton}
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`/detail/${item.contentid}/${item.contenttypeid}`, '_blank')
                        }}>
                        자세히 보기
                      </button>
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
                            duration: tab === 'tour' ? '소요시간 추가 예정' : '소요시간 추가 예정',
                          })
                        }}>
                        일정 추가
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {displayResults.length > itemsPerPage && (
                <div className={styles.pagination}>
                  <button className={styles.pageBtn} onClick={handleFirstPage} disabled={currentPage === 1}>
                    &laquo;
                  </button>
                  <button className={styles.pageBtn} onClick={handlePrevBlock} disabled={blockstart === 1}>
                    &lt;
                  </button>
                  {Array.from({ length: blockEnd - blockstart + 1 }).map((_, i) => {
                    const page = blockstart + i
                    return (
                      <button key={page} className={currentPage === page ? styles.activePageBtn : styles.pageBtn} onClick={() => setCurrentPage(page)}>
                        {page}
                      </button>
                    )
                  })}
                  <button className={styles.pageBtn} onClick={handleNextBlock} disabled={blockEnd === totalPages}>
                    &gt;
                  </button>
                  <button className={styles.pageBtn} onClick={handleLastPage} disabled={currentPage === totalPages}>
                    &raquo;
                  </button>
                </div>
              )}
            </div>
            <div className={styles.mapArea} data-aos="fade-up" data-aos-delay="120">
              <h2 className={styles.maptitle}>위치 정보</h2>
              <div className={styles.mapBoxWrapper}>
                <div ref={mapRef} className={styles.mapBox} />
                {distance !== null && <div className={styles.distanceInfo}> - 현재 위치와의 직선 거리: {(distance / 1000).toFixed(2)}km</div>}
              </div>
            </div>
          </div>
        )}
      </main>
      {selectedPlace && <AddPlaceModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
      <AreaSelectModal
        open={isAreaModalOpen}
        onClose={() => setIsAreaModalOpen(false)}
        onSelect={(area, sigungu, sigunguName) => {
          setSelectedAreaCode(area || '')
          setSelectedSigunguCode(sigungu)
          setSelectedSigunguName(sigunguName)
        }}
        selectedAreaCode={selectedAreaCode}
        selectedDistrict={selectedSigunguCode}
      />
    </div>
  )
}

export default AiSearchPage
