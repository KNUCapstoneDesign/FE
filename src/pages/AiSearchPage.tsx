// src/pages/AiSearchPage.tsx
import React, { useRef, DragEvent, useEffect, useState } from 'react'
import styles from '../assets/AiSearchPage.module.css'
import { readFileAsBase64 } from '../utils/imageToBase64'
import { analyzeImageWithVisionAPI } from '../utils/visionApi'
import { translateToKoreanWithGoogle } from '../utils/translate'
import { searchTour } from '../utils/searchTour'
import { useAiSearchStore } from '../store/AiSearchStore'
import { Place } from '../store/useMyTravelStore'
import AddPlaceModal from '../components/AddPlaceModal'
import { useAuthStore } from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

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

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [distance, setDistance] = useState<number | null>(null)

  const distanceLabelMarker = useRef<naver.maps.Marker | null>(null)

  const itemsPerPage = 5
  const PAGE_BLOCK = 10
  const { tab, imageUrl, labels, selectedLabel, results, setTab, setImageUrl, setLabels, setSelectedLabel, setResults, reset } = useAiSearchStore()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

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
    try {
      const contentTypeId = tab === 'restaurant' ? '39' : '12'
      const searchResults = await searchTour(label, contentTypeId)
      setResults(searchResults)
      setCurrentPage(1)
    } catch (error) {
      console.error('❌ 라벨 검색 오류:', error)
    }
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

  const totalPages = Math.ceil(results.length / itemsPerPage)
  const currentBlock = Math.floor((currentPage - 1) / PAGE_BLOCK)
  const blockstart = currentBlock * PAGE_BLOCK + 1
  const blockEnd = Math.min(blockstart + PAGE_BLOCK - 1, totalPages)

  const handleFirstPage = () => setCurrentPage(1)
  const handleLastPage = () => setCurrentPage(totalPages)
  const handlePrevBlock = () => setCurrentPage(Math.max(1, blockstart - PAGE_BLOCK))
  const handleNextBlock = () => setCurrentPage(Math.min(totalPages, blockEnd + 1))

  const paginatedResults = results.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    if (!isAuthenticated) {
      alert('로그인 후 이용 가능합니다.')
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.main}>
        <h1 className={styles.title}>이미지로 검색하기</h1>
        <p className={styles.subtitle}>음식이나 관광지 사진을 업로드하여 관련 정보를 찾아보세요!</p>
        <p className={styles.subtitle2}>※ AI가 이미지를 판별하기 때문에 정확하지 않을 수 있습니다.</p>

        <div className={styles.tabButtons}>
          <button className={`${styles.tabButton} ${tab === 'restaurant' ? styles.active : ''}`} onClick={() => handleTabChange('restaurant')}>
            음식점
          </button>
          <button className={`${styles.tabButton} ${tab === 'tour' ? styles.active : ''}`} onClick={() => handleTabChange('tour')}>
            관광지
          </button>
        </div>

        {!imageUrl && (
          <div className={`${styles.uploadBox} ${isDragging ? styles.dragging : ''}`} onClick={triggerFileInput} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <div className={styles.uploadText}>이미지 업로드 또는 여기에 드래그하세요</div>
            <input type="file" ref={inputRef} accept="image/*" onChange={handleFileChange} className={styles.uploadInput} />
          </div>
        )}
        {imageUrl && (
          <div className={styles.previewImageWrapper}>
            <img src={imageUrl} alt="미리보기" className={styles.previewImage} style={{ pointerEvents: 'none' }} />
          </div>
        )}

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

              {results.length > itemsPerPage && (
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
            <div className={styles.mapArea}>
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
    </div>
  )
}

export default AiSearchPage
