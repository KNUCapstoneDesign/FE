import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import styles from '../assets/DetailPage.module.css'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

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
    const fetchMenus = async () => {
      if (data?.contentTypeId !== 39 || !data.title) return // 음식점 아니면 무시

      try {
        const res = await fetch(`https://capstonedesign-iota.vercel.app/api/diningcode-scrape?name=${encodeURIComponent(data.title)}`)
        const json = await res.json()
        if (json.menus) setMenus(json.menus)
      } catch (err) {
        console.error('메뉴 크롤링 실패:', err)
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

        const [commonRes, imageRes, introRes] = await Promise.all([fetch(commonUrl), fetch(imageUrl), fetch(introUrl)])

        const commonJson = await commonRes.json()
        const imageJson = await imageRes.json()
        const introJson = await introRes.json()

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
      <h1 className={styles.title}>{data.title}</h1>
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
        </div>
        <div className={styles.mapBox}>
          <h2>위치 정보</h2>
          <div ref={mapRef} className={styles.mapPlaceholder}></div>
        </div>
      </div>

      {data.contentTypeId === 39 && menus && (
        <div className={styles.menuSection}>
          <h2>대표 메뉴</h2>
          <ul>
            {menus.map((menu, i) => (
              <li key={i}>
                {menu.name} - {menu.price || '가격 정보 없음'}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.detailDescription}>
        <h2>상세 설명</h2>
        <p>{data.overview || '설명 정보 없음'}</p>
      </div>

      {isModalOpen && selectedImage && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalNavPrev} onClick={handlePrev}>
              ‹
            </button>
            <img src={selectedImage} alt="확대 이미지" className={styles.modalImage} />
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
    </div>
  )
}

export default DetailPage
