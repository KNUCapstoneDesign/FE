import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import styles from '../assets/DetailPage.module.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import AddPlaceModal from '../components/AddPlaceModal'
import { Place } from '../store/useMyTravelStore'

interface NearbyPlace {
  contentid: string
  contenttypeid: string
  title: string
  firstimage?: string
}

interface DetailItem {
  title: string
  contentTypeId: number
  overview?: string
  addr1?: string
  tel?: string
  usetime?: string
  usefee?: string
  homepage?: string
  images: string[]
  mapx?: number
  mapy?: number
}

interface ImageItem {
  originimgurl: string
}

const getCategoryLabel = (typeId: number) => {
  switch (typeId) {
    case 12:
      return '관광지'
    case 14:
      return '문화시설'
    case 15:
      return '행사/공연/축제'
    case 25:
      return '여행코스'
    case 28:
      return '레포츠'
    case 32:
      return '숙박'
    case 38:
      return '쇼핑'
    case 39:
      return '음식점'
    default:
      return '기타'
  }
}

const DetailPage: React.FC = () => {
  const { id, typeid } = useParams<{ id: string; typeid: string }>()
  const [data, setData] = useState<DetailItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_KEY = import.meta.env.VITE_API_KEY1!
  const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID!
  const mapRef = useRef<HTMLDivElement>(null)
  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [menus, setMenus] = useState<{ name: string; price: string }[] | null>(null)
  const [menusLoading, setMenusLoading] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [popularPlaces, setPopularPlaces] = useState<NearbyPlace[]>([])
  const [courseSpots, setCourseSpots] = useState<any[]>([])
  const [rating, setRating] = useState<string | null>(null)
  const [expandedSpots, setExpandedSpots] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    if (!data?.mapx || !data.mapy) return

    const fetchNearby = async () => {
      const locationUrl =
        `https://apis.data.go.kr/B551011/KorService1/locationBasedList1?serviceKey=${API_KEY}` +
        `&MobileOS=ETC&MobileApp=TestApp&_type=json` +
        `&mapX=${data.mapx}&mapY=${data.mapy}&radius=3000&arrange=E&numOfRows=20`

      try {
        const res = await fetch(locationUrl)
        const json = await res.json()
        const items = json.response?.body?.items?.item || []
        const results = Array.isArray(items) ? items : [items]

        // ✅ contenttypeid로 필터링하지 않음. 자기 자신만 제외
        const filtered = results.filter((place) => place.contentid !== id)
        setNearbyPlaces(filtered.slice(0, 8))
      } catch (err) {
        console.error('주변 장소 불러오기 실패:', err)
      }
    }

    fetchNearby()
  }, [data, API_KEY, id])

  useEffect(() => {
    if (!data?.addr1) return
    const sido = data.addr1.split(' ')[0]
    const sigungu = data.addr1.split(' ')[1] || ''
    const fetchPopular = async () => {
      const areaUrl =
        `https://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${API_KEY}` + `&MobileOS=ETC&MobileApp=TestApp&_type=json` + `&arrange=B&numOfRows=5&keyword=${sido} ${sigungu}`

      try {
        const res = await fetch(areaUrl)
        const json = await res.json()
        const items = json.response?.body?.items?.item || []
        const results = Array.isArray(items) ? items : [items]
        setPopularPlaces(results)
      } catch (err) {
        console.error('인기 장소 불러오기 실패:', err)
      }
    }
    fetchPopular()
  }, [data, API_KEY])

  const handleAddPlaceClick = () => {
    if (!data) return
    setSelectedPlace({
      contentid: Number(id),
      contenttypeid: Number(typeid),
      title: data.title,
      firstimage: data.images[0], // 첫 번째 이미지
      addr1: data.addr1,
      mapx: data.mapx,
      mapy: data.mapy,
    })
  }

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }, [])

  const handlePrev = useCallback(() => {
    if (!data) return
    const prev = (currentIndex - 1 + data.images.length) % data.images.length
    setCurrentIndex(prev)
    setSelectedImage(data.images[prev])
  }, [currentIndex, data])

  const handleNext = useCallback(() => {
    if (!data) return
    const next = (currentIndex + 1) % data.images.length
    setCurrentIndex(next)
    setSelectedImage(data.images[next])
  }, [currentIndex, data])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isModalOpen) return
      if (e.key === 'Escape') closeModal()
      else if (e.key === 'ArrowLeft') handlePrev()
      else if (e.key === 'ArrowRight') handleNext()
    },
    [closeModal, handlePrev, handleNext, isModalOpen],
  )

  useEffect(() => {
    if (data?.contentTypeId !== 39 || !data.title) {
      setMenus(null)
      setRating(null) // ⭐ 페이지 이동 시 별점 초기화
      return
    }
    setMenus(null)
    setMenusLoading(true)
    setRating(null) // ⭐ 메뉴 로딩 시작 시 별점 초기화
    // 주소에서 시와 구 추출 (예: 서울특별시 종로구 인사동 12-3 → 서울특별시 종로구)
    let sido = ''
    let gu = ''
    if (data.addr1) {
      const addrParts = data.addr1.split(' ')
      if (addrParts.length >= 2) {
        sido = addrParts[0]
        gu = addrParts[1]
      }
    }
    const searchName = gu && sido ? `${data.title} ${sido} ${gu}` : data.title
    const fetchMenus = async () => {
      try {
        const res = await fetch(`https://port-0-planit-mcmt59q6ef387a77.sel5.cloudtype.app/api/menu?name=${encodeURIComponent(searchName)}`,
          { credentials: 'include' })
        const json = await res.json()
        setMenus(json.menus)
        setRating(json.rating || null)
      } catch (err) {
        console.error('메뉴 가져오기 실패:', err)
        setMenus(null)
        setRating(null)
      } finally {
        setMenusLoading(false)
      }
    }
    fetchMenus()
  }, [data])

  // Naver Map 스크립트 삽입
  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`
    script.async = true
    script.onload = () => {
      setIsMapScriptLoaded(true)
    }
    script.onerror = () => {
      console.error('Failed to load Naver Maps script')
      setError('지도 스크립트를 불러오지 못했습니다.')
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [NAVER_MAP_CLIENT_ID])

  // 지도 생성
  useEffect(() => {
    if (!isMapScriptLoaded || !data?.mapx || !data.mapy || !mapRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const naver = (window as any).naver
    if (!naver) return

    const location = new naver.maps.LatLng(data.mapy, data.mapx)
    const map = new naver.maps.Map(mapRef.current, {
      center: location,
      zoom: 14,
    })
    new naver.maps.Marker({ position: location, map })
  }, [isMapScriptLoaded, data])

  useEffect(() => {
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown)
    else window.removeEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, handleKeyDown])

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        const commonUrl = [
          `https://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${API_KEY}`,
          `MobileOS=ETC`,
          `MobileApp=TestAPP`,
          `_type=json`,
          `contentId=${id}`,
          `contentTypeId=${typeid}`,
          `defaultYN=Y`,
          `overviewYN=Y`,
          `addrinfoYN=Y`,
          `firstImageYN=Y`,
          `mapinfoYN=Y`,
        ].join('&')
        const imageUrl = [
          `https://apis.data.go.kr/B551011/KorService1/detailImage1?serviceKey=${API_KEY}`,
          `MobileOS=ETC`,
          `MobileApp=TestAPP`,
          `_type=json`,
          `contentId=${id}`,
          `imageYN=Y`,
          `subImageYN=Y`,
          `numOfRows=100`,
        ].join('&')
        const introUrl = [
          `https://apis.data.go.kr/B551011/KorService1/detailIntro1?serviceKey=${API_KEY}`,
          `MobileOS=ETC`,
          `MobileApp=TestAPP`,
          `_type=json`,
          `contentId=${id}`,
          `contentTypeId=${typeid}`,
        ].join('&')
        // detailInfo1 API (여행코스용)
        let infoJson = null
        let courseSpotsArr: any[] = []
        if (typeid === '25') {
          const infoUrl = [
            `https://apis.data.go.kr/B551011/KorService1/detailInfo1?serviceKey=${API_KEY}`,
            `MobileOS=ETC`,
            `MobileApp=TestAPP`,
            `_type=json`,
            `contentId=${id}`,
            `contentTypeId=${typeid}`,
          ].join('&')
          const infoRes = await fetch(infoUrl)
          infoJson = await infoRes.json()
          console.log('detailInfo1:', infoJson)
          // 하위 코스별 장소 정보 요청
          const items = infoJson.response?.body?.items?.item || []
          const arr = Array.isArray(items) ? items : [items]
          // subcontentid로 detailCommon1 요청
          courseSpotsArr = await Promise.all(
            arr.map(async (spot) => {
              if (!spot.subcontentid) return null
              const spotUrl = [
                `https://apis.data.go.kr/B551011/KorService1/detailCommon1?serviceKey=${API_KEY}`,
                `MobileOS=ETC`,
                `MobileApp=TestAPP`,
                `_type=json`,
                `contentId=${spot.subcontentid}`,
                `defaultYN=Y`,
                `firstImageYN=Y`,
              ].join('&')
              try {
                const res = await fetch(spotUrl)
                const json = await res.json()
                const item = json.response?.body?.items?.item
                const info = Array.isArray(item) ? item[0] : item
                return {
                  ...spot,
                  detail: info,
                }
              } catch (e) {
                return { ...spot, detail: null }
              }
            }),
          )
          setCourseSpots(courseSpotsArr.filter(Boolean))
        }

        const [commonRes, imageRes, introRes] = await Promise.all([fetch(commonUrl), fetch(imageUrl), fetch(introUrl)])

        const commonJson = await commonRes.json()
        const imageJson = await imageRes.json()
        const introJson = await introRes.json()

        // 모든 API 응답을 콘솔에 출력
        console.log('detailCommon1:', commonJson)
        console.log('detailImage1:', imageJson)
        console.log('detailIntro1:', introJson)

        const rawItem = commonJson.response?.body?.items?.item
        const item = Array.isArray(rawItem) ? rawItem[0] : rawItem

        const rawImages = imageJson.response?.body?.items?.item || []
        const arr = Array.isArray(rawImages) ? rawImages : [rawImages]
        const imageUrls = (arr as ImageItem[]).map((i) => i.originimgurl).filter(Boolean)

        const rawIntro = introJson.response?.body?.items?.item
        const introItem = Array.isArray(rawIntro) ? rawIntro[0] : rawIntro

        if (!item) {
          setError('상세 정보를 불러올 수 없습니다.')
          return
        }

        const contentTypeId = Number(typeid!)
        let tel = ''
        let usetime = ''
        let usefee = ''
        switch (contentTypeId) {
          case 12:
            tel = introItem?.infocenter
            usetime = introItem?.usetime
            usefee = introItem?.usefee
            break
          case 14:
            tel = introItem?.infocenterculture
            usetime = introItem?.usetimeculture
            usefee = introItem?.usefee
            break
          case 15:
            tel = introItem?.sponsor1tel
            usetime = introItem?.playtime
            usefee = introItem?.usetimefestival
            break
          case 25:
            tel = introItem?.infocentertourcourse
            usetime = introItem?.taketime
            break
          case 28:
            tel = introItem?.infocenterleports
            usetime = introItem?.usetimeleports
            break
          case 32:
            tel = introItem?.infocenterlodging
            usetime = `체크인: ${introItem?.checkintime || ''}, 체크아웃: ${introItem?.checkouttime || ''}`
            break
          case 39:
            tel = introItem?.infocenterfood
            usetime = introItem?.opentimefood
            break
          default:
            tel = ''
            usetime = ''
            usefee = ''
        }

        setData({
          title: item.title,
          contentTypeId,
          overview: item.overview,
          addr1: item.addr1,
          tel,
          usetime,
          usefee,
          homepage: item.homepage,
          images: imageUrls.length ? imageUrls : item.firstimage ? [item.firstimage] : [],
          mapx: item.mapx,
          mapy: item.mapy,
        })
      } catch (e) {
        console.error('데이터 로드 오류:', e)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id, typeid, API_KEY])

  const handleToggleExpand = (idx: number) => {
    setExpandedSpots(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  if (loading) return <div className={styles.loading}>로딩 중...</div>
  if (error) return <div className={styles.error}>{error}</div>
  if (!data) return null

  const raw = data.homepage || ''
  if (typeof raw !== 'string') {
    console.error('Invalid homepage data:', raw)
    setError('홈페이지 데이터가 유효하지 않습니다.')
    return null
  }
  const regex = new RegExp('href="([^"]+)"[^>]*>([^<]+)</a>')
  const m = raw.match(regex)
  const homepageUrl = m ? m[1] : raw
  const homepageText = m ? m[2] : raw

  return (
    <div className={styles.wrapper}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{data.title}</h1>
        <button className={styles.addButton} onClick={handleAddPlaceClick}>
          일정 추가
        </button>
      </div>

      <span className={styles.typeLabel}>{getCategoryLabel(data.contentTypeId)}</span>
      <span className={styles.titleaddress}>{data.addr1 || '정보 없음'}</span>
      <div className={styles.heroImageWrapper}>
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop>
          {data.images.map((url, i) => (
            <SwiperSlide key={i}>
              <img
                src={url}
                alt={`이미지 ${i + 1}`}
                className={styles.heroImage}
                onClick={() => {
                  setCurrentIndex(i)
                  setSelectedImage(url)
                  setIsModalOpen(true)
                }}
                style={{ cursor: 'zoom-in' }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className={styles.detailDescription}>
        <h2>상세 설명</h2>
        <p>{data.overview || '설명 정보 없음'}</p>
      </div>
      <div className={styles.infoSection}>
        <div className={styles.infoBox}>
          <h2>기본 정보</h2>
          <p>
            <span className={styles.label}>운영시간</span>
            <span className={styles.value}>{data.usetime || '정보 없음'}</span>
          </p>
          <p>
            <span className={styles.label}>입장료</span>
            <span className={styles.value}>{data.usefee || '정보 없음'}</span>
          </p>
          <p>
            <span className={styles.label}>주소</span>
            <span className={styles.value}>{data.addr1 || '정보 없음'}</span>
          </p>
          <p>
            <span className={styles.label}>연락처</span>
            <span className={styles.value}>{data.tel || '정보 없음'}</span>
          </p>
          {homepageUrl && (
            <p>
              <span className={styles.label}>홈페이지</span>
              <span className={styles.value}>
                <a href={homepageUrl} target="_blank" rel="noopener noreferrer">
                  {homepageText}
                </a>
              </span>
            </p>
          )}
          {data.contentTypeId === 39 && (
            <div className={styles.menuSection}>
              <h2>대표 메뉴</h2>
              {/* 평점 표시 */}
              {rating && (
                <div className={styles.menuRatingBox}>
                  <span className={styles.starRating}>
                    <span className={styles.starRatingBg}>★★★★★</span>
                    <span
                      className={styles.starRatingFg}
                      style={{ width: `${(Number(rating) / 5) * 100}%`, display: 'inline-block', position: 'absolute', top: 0, left: 0, overflow: 'hidden' }}
                    >
                      ★★★★★
                    </span>
                  </span>
                  <span className={styles.ratingValue}>{rating}</span>
                  <span className={styles.ratingLabel}>평점</span>
                </div>
              )}
              {menusLoading ? (
                <div className={styles.menuLoadingWrapper}>
                  <div className={styles.menuSpinner}></div>
                  <div>메뉴 탐색중...(3~40초 소요)</div>
                </div>
              ) : menus && menus.length > 0 ? (
                <ul>
                  {menus.map((menu, i) => (
                    <li key={i}>
                  <span className={styles.menuName}>{menu.name}</span>
                  <span className={styles.menuPrice}>{menu.price || '가격 정보 없��'}</span>
                </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.noMenu}>메뉴 정보 없음</div>
              )}
            </div>
          )}
        </div>
        <div className={styles.mapBox}>
          <h2>위치 정보</h2>
          <div ref={mapRef} className={styles.mapPlaceholder}></div>
        </div>
      </div>

      {/* 여행코스 하위 장소 정보 */}
      {data.contentTypeId === 25 && courseSpots.length > 0 && (
        <div className={styles.courseSpotsSection}>
          <h2>코스별 주요 장소</h2>
          <ul className={styles.courseSpotsList}>
            {courseSpots.map((spot, idx) => {
              const desc = (spot.subdetailoverview || spot.detail?.overview || '설명 없음').replace(/<br\s*\/?>/gi, '')
              const isExpanded = expandedSpots[idx]
              const isLong = desc.length > 200
              const shortDesc = desc.slice(0, 200)
              return (
                <li key={spot.subcontentid || idx} className={styles.courseSpotItem}>
                  <Link to={`/detail/${spot.subcontentid}/${spot.detail?.contenttypeid || ''}`}
                        className={styles.courseSpotLink}>
                    <div className={styles.courseSpotImgWrap}>
                      <img src={spot.detail?.firstimage || spot.subdetailimg || '/noimage.jpg'}
                           alt={spot.subname || spot.detail?.title || ''} className={styles.courseSpotImg} />
                    </div>
                    <div className={styles.courseSpotInfo}>
                      <strong>{spot.subname || spot.detail?.title || '장소명 없음'}</strong>
                      <div style={{ whiteSpace: 'pre-line', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isExpanded || !isLong ? desc : shortDesc + '...'}
                        {isLong && (
                          <button
                            type="button"
                            style={{ marginLeft: 8, color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95em' }}
                            onClick={e => { e.preventDefault(); handleToggleExpand(idx) }}
                          >
                            {isExpanded ? '접기' : '더보기'}
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {isModalOpen && selectedImage && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalNavPrev} onClick={handlePrev}>
              ‹
            </button>
            <img src={selectedImage} alt="확대 이���지" className={styles.modalImage} />
            <button className={styles.modalNavNext} onClick={handleNext}>
              ›
            </button>
            <div className={styles.thumbnailContainer}>
              {data.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`썸네일 ${i + 1}`}
                  className={`${styles.thumbnail} ${i === currentIndex ? styles.activeThumbnail : ''}`}
                  onClick={() => {
                    setCurrentIndex(i)
                    setSelectedImage(img)
                  }}
                />
              ))}
            </div>
            <button className={styles.modalClose} onClick={closeModal}>
              ✕
            </button>
          </div>
        </div>
      )}
      {selectedPlace && <AddPlaceModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
      {nearbyPlaces.length > 0 && (
        <div className={styles.recommendSection}>
          <h2>주변 장소</h2>
          <div className={styles.recommendList}>
            {nearbyPlaces.map((place) => (
              <Link key={place.contentid} to={`/detail/${place.contentid}/${place.contenttypeid}`}
                    className={styles.recommendCard}>
                <img src={place.firstimage || '/noimage.jpg'} alt={place.title} className={styles.recommendImage} />
                <div className={styles.recommendTitle}>{place.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 같은 지역 인기 여행지 */}
      {popularPlaces.length > 0 && (
        <div className={styles.recommendSection}>
          <h2>🔥 이 지역의 인기 장소</h2>
          <div className={styles.recommendList}>
            {popularPlaces.map((place) => (
              <Link key={place.contentid} to={`/detail/${place.contentid}/${place.contenttypeid}`}
                    className={styles.recommendCard}>
                <img src={place.firstimage || '/noimage.jpg'} alt={place.title} className={styles.recommendImage} />
                <div className={styles.recommendTitle}>{place.title}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DetailPage
