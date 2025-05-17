// src/pages/AiSearchPage.tsx
import React, { useRef, DragEvent, useEffect, useState } from 'react'
import styles from '../assets/AiSearchPage.module.css'
import { readFileAsBase64 } from '../utils/imageToBase64'
import { analyzeImageWithVisionAPI } from '../utils/visionApi'
import { translateToKoreanWithGoogle } from '../utils/translate'
import { searchTour } from '../utils/searchTour'
import { useAiSearchStore } from '../store/AiSearchStore'

const NAVER_SCRIPT_ID = 'naver-map-script'

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

  const itemsPerPage = 5
  const PAGE_BLOCK = 10
  const { tab, imageUrl, labels, selectedLabel, results, setTab, setImageUrl, setLabels, setSelectedLabel, setResults, reset } = useAiSearchStore()

  // 페이지 진입(마운트) 시 무조건 상태 초기화!
  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 네이버 스크립트 로드
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

  // 위치 선택 시 지도 초기화/업데이트
  useEffect(() => {
    if (!naverReady || !selectedLocation || !mapRef.current) return

    const { mapx, mapy } = selectedLocation
    const container = mapRef.current
    const position = new window.naver.maps.LatLng(mapy, mapx)

    if (!mapInstance.current) {
      mapInstance.current = new window.naver.maps.Map(container, {
        center: position,
        zoom: 14,
      })
    } else {
      mapInstance.current.setCenter(position)
    }

    if (markerInstance.current) {
      markerInstance.current.setMap(null)
    }
    markerInstance.current = new window.naver.maps.Marker({
      position,
      map: mapInstance.current,
    })
  }, [selectedLocation, naverReady])

  // 이미지 업로드
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

  // 라벨 클릭 → API 검색
  const handleLabelClick = async (label: string) => {
    setSelectedLabel(label)
    try {
      const contentTypeId = tab === 'restaurant' ? '39' : '12'
      const searchResults = await searchTour(label, contentTypeId)
      setResults(searchResults)
      setCurrentPage(1)
    } catch (error) {
      console.error('❌ 라벨 검색 오류:', error)
    }
  }

  // 탭 변경
  const handleTabChange = (newTab: 'restaurant' | 'tour') => {
    setTab(newTab)
    setImageUrl(null)
    setLabels([])
    setResults([])
    setSelectedLabel(null)
    setCurrentPage(1)
    setSelectedLocation(null)
    setSelectedCardId(null)

    if (markerInstance.current) {
      markerInstance.current.setMap(null)
      markerInstance.current = null
    }
    if (mapInstance.current) {
      mapInstance.current = null
    }
  }

  // 지도 이펙트
  useEffect(() => {
    if (!naverReady || !mapRef.current) return

    if (!selectedLocation) {
      if (markerInstance.current) {
        markerInstance.current.setMap(null)
        markerInstance.current = null
      }
      if (mapInstance.current) {
        const maybeMap = mapInstance.current as { destroy?: () => void }
        if (typeof maybeMap.destroy === 'function') {
          maybeMap.destroy()
        }
        mapInstance.current = null
      }
      return
    }

    const { mapx, mapy } = selectedLocation
    const container = mapRef.current
    const position = new window.naver.maps.LatLng(mapy, mapx)

    if (!mapInstance.current) {
      mapInstance.current = new window.naver.maps.Map(container, {
        center: position,
        zoom: 14,
      })
    } else {
      mapInstance.current.setCenter(position)
    }

    if (markerInstance.current) {
      markerInstance.current.setMap(null)
    }
    markerInstance.current = new window.naver.maps.Marker({
      position,
      map: mapInstance.current,
    })
  }, [selectedLocation, naverReady])

  // 드래그 & 파일
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

  const totalPages = Math.ceil(results.length / itemsPerPage)
  const currentBlock = Math.floor((currentPage - 1) / PAGE_BLOCK)
  const blockstart = currentBlock * PAGE_BLOCK + 1
  const blockEnd = Math.min(blockstart + PAGE_BLOCK - 1, totalPages)

  const handleFirstPage = () => setCurrentPage(1)
  const handleLastPage = () => setCurrentPage(totalPages)
  const handlePrevBlock = () => setCurrentPage(Math.max(1, blockstart - PAGE_BLOCK))
  const handleNextBlock = () => setCurrentPage(Math.min(totalPages, blockEnd + 1))

  const paginatedResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <h1 className={styles.title}>이미지로 검색하기</h1>
        <p className={styles.subtitle}>음식이나 관광지 사진을 업로드하여 관련 정보를 찾아보세요!</p>
        <p className={styles.subtitle2}>※ AI가 이미지를 판별하기 때문에 정확하지 않을 수 있습니다.</p>

        {/* 탭 버튼 */}
        <div className={styles.tabButtons}>
          <button className={`${styles.tabButton} ${tab === 'restaurant' ? styles.active : ''}`} onClick={() => handleTabChange('restaurant')}>
            음식점
          </button>
          <button className={`${styles.tabButton} ${tab === 'tour' ? styles.active : ''}`} onClick={() => handleTabChange('tour')}>
            관광지
          </button>
        </div>

        {/* 이미지 업로드 영역 */}
        {!imageUrl && (
          <div className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''}`} onClick={triggerFileInput} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className={styles.uploadText}>이미지 업로드 또는 여기에 드래그하세요</div>
            <input type="file" ref={inputRef} accept="image/*" onChange={handleFileChange} className={styles.uploadInput} />
          </div>
        )}
        {imageUrl && <img src={imageUrl} alt="미리보기" className={styles.previewImage} style={{ pointerEvents: 'none' }} />}

        {/* 분석 결과 라벨 */}
        {labels.length > 0 && (
          <div className={styles.labels}>
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

        {/* 검색 결과 및 지도 */}
        {selectedLabel && (
          <div className={styles.resultArea}>
            <div className={styles.resultList}>
              <h2 className={styles.resulth2}>
                {selectedLabel ? `"${selectedLabel}" 검색 결과` : '검색 결과'}
                <span className={styles.resultCount}>{results.length}개의 검색결과</span>
              </h2>
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
                    <button
                      className={styles.detailButton}
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`/detail/${item.contentid}/${item.contenttypeid}`, '_blank')
                      }}>
                      자세히 보기
                    </button>
                  </div>
                </div>
              ))}

              {/* 페이지네이션 */}
              {results.length > itemsPerPage && (
                <div className={styles.pagination}>
                  <button className={styles.pageBtn} onClick={handleFirstPage} disabled={currentPage === 1} aria-label="첫 페이지">
                    &laquo;
                  </button>
                  <button className={styles.pageBtn} onClick={handlePrevBlock} disabled={blockstart === 1} aria-label="이전 10페이지">
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
                  <button className={styles.pageBtn} onClick={handleNextBlock} disabled={blockEnd === totalPages} aria-label="다음 10페이지">
                    &gt;
                  </button>
                  <button className={styles.pageBtn} onClick={handleLastPage} disabled={currentPage === totalPages} aria-label="마지막 페이지">
                    &raquo;
                  </button>
                </div>
              )}
            </div>

            {/* 지도 영역 */}
            <div className={styles.mapBoxWrapper}>
              <h2 className={styles.maptitle}>위치 정보</h2>
              <div ref={mapRef} className={styles.mapBox} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AiSearchPage
