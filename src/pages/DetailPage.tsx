import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import styles from '../assets/DetailPage.module.css'
import {Carousel} from '../components/Carousel.tsx'
import AddPlaceModal from '../components/AddPlaceModal'
import { Place } from '../store/useMyTravelStore'
import {
  FaInfoCircle,
  FaMapMarkedAlt,
  FaPhone,
  FaRegClock,
  FaTicketAlt,
  FaMoneyBillWave,
  FaParking,
  FaHome,
  FaUtensils,
  FaStar,
  FaRoute,
  FaBed,
  FaShoppingBag,
  FaTree,
  FaBuilding,
  FaCalendarAlt,
  FaFilm,
  FaDog,
  FaCreditCard,
  FaGift,
  FaBaby,
} from 'react-icons/fa'

// #region --- 타입 정의 (Interfaces) ---

// TourAPI 기본 응답 구조
interface TourAPIBaseResponse<T> {
  response?: {
    body?: {
      items?: {
        item: T | T[]
      }
      totalCount?: number
    }
  }
}

// 주변/인기 장소 정보
interface NearbyPlace {
  contentid: string
  contenttypeid: string
  title: string
  firstimage?: string
}

// 이미지 API 아이템
interface ImageItem {
  originimgurl: string
}

// 공통 정보 (detailCommon2)
interface DetailCommonItem {
  title: string
  overview: string
  addr1: string
  homepage: string
  firstimage?: string
  mapx: number
  mapy: number
  contenttypeid: number
}

// 소개 정보 (detailIntro2) - 각 타입별 필드가 매우 다르므로 필요한 것만 옵셔널로 정의
interface DetailIntroItem {
  infocenter?: string
  usetime?: string
  usefee?: string
  infocenterculture?: string
  usetimeculture?: string
  sponsor1tel?: string
  playtime?: string
  usetimefestival?: string
  infocentertourcourse?: string
  taketime?: string
  infocenterleports?: string
  usetimeleports?: string
  infocenterlodging?: string
  checkintime?: string
  checkouttime?: string
  infocenterfood?: string
  opentimefood?: string
  restdate?: string
  parking?: string
  heritage1?: string
  heritage2?: string
  heritage3?: string
  chkpet?: string
  chkcreditcard?: string
  restdateculture?: string
  spendtime?: string
  parkingfee?: string
  chkpetculture?: string
  eventstartdate?: string
  eventenddate?: string
  eventplace?: string
  sponsor2tel?: string
  openperiod?: string
  expagerangeleports?: string
  parkingleports?: string
  parkingfeeleports?: string
  restdateleports?: string
  usefeeleports?: string
  fairday?: string
  opentime?: string
  restdateshopping?: string
  saleitem?: string
  saleitemcost?: string
  chkcreditcardshopping?: string
  chkpetshopping?: string
  shopguide?: string
  infocentershopping?: string
  restdatefood?: string
  firstmenu?: string
  treatmenu?: string
  packing?: string
  parkingfood?: string
  chkcreditcardfood?: string
  reservationfood?: string
}

// 숙박 추가 정보 (detailInfo2 for type 32)
interface LodgingInfoItem {
  roomtitle?: string
  reservationlodging?: string
  reservationurl?: string
  parkinglodging?: string
  roomsize1?: string
  roomcount?: string
  roomtype?: string
  roombasecount?: string
  roommaxcount?: string
  // 객실 이미지는 roomimg1, roomimg2... 형태
  [key: string]: string | undefined
}

// 소개 정보와 숙박 추가 정보를 병합한 타입
type ExtraIntroData = DetailIntroItem & LodgingInfoItem

// 여행 코스 스팟 정보 (detailInfo2 for type 25)
interface CourseInfoItem {
  subcontentid: string
  subdetailimg: string
  subdetailoverview: string
  subname: string
}

// API에서 받아온 CourseInfoItem에 상세정보(detail)를 추가한 타입
interface CourseSpotItem extends CourseInfoItem {
  detail: DetailCommonItem | null
}

// 최종적으로 컴포넌트가 사용할 데이터 구조
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
  extraIntro: ExtraIntroData
}

// 메뉴/평점 API 응답 타입
interface MenuResponse {
  menus: { name: string; price: string }[]
  rating?: string
}

// Naver Maps 타입을 위한 전역 window 객체 확장
declare global {
  interface Window {
    naver: any
  }
}

// #endregion

// API 응답의 item이 단일 객체이거나 배열일 경우를 정규화하는 헬퍼 함수
function normalizeToArray<T>(item: T | T[] | undefined): T[] {
  if (!item) return []
  return Array.isArray(item) ? item : [item]
}
const DetailPage: React.FC = () => {
  const { id, typeid } = useParams<{ id: string; typeid: string }>()
  const [data, setData] = useState<DetailItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const API_KEY = import.meta.env.VITE_API_KEY1!
  const NAVER_MAP_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID!

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [, setModalGallery] = useState<'main' | 'room'>('main')

  const [menus, setMenus] = useState<{ name: string; price: string }[] | null>(null)
  const [menusLoading, setMenusLoading] = useState(false)
  const [rating, setRating] = useState<string | null>(null)

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([])
  const [popularPlaces, setPopularPlaces] = useState<NearbyPlace[]>([])
  const [courseSpots, setCourseSpots] = useState<CourseSpotItem[]>([])

  const [distance, setDistance] = useState<number | null>(null)

  useEffect(() => {
    if (!data?.mapx || !data.mapy) return

    const fetchNearby = async () => {
      const locationUrl =
        `https://apis.data.go.kr/B551011/KorService2/locationBasedList2?serviceKey=${API_KEY}` +
        `&MobileOS=ETC&MobileApp=TestApp&_type=json` +
        `&mapX=${data.mapx}&mapY=${data.mapy}&radius=3000&arrange=E&numOfRows=20`

      try {
        const res = await fetch(locationUrl)
        const json: TourAPIBaseResponse<NearbyPlace> = await res.json()
        const items = normalizeToArray(json.response?.body?.items?.item)
        const filtered = items.filter((place) => place.contentid !== id)
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
        `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${API_KEY}` +
        `&MobileOS=ETC&MobileApp=TestApp&_type=json` +
        `&arrange=B&numOfRows=5&keyword=${encodeURIComponent(`${sido} ${sigungu}`)}`

      try {
        const res = await fetch(areaUrl)
        const json: TourAPIBaseResponse<NearbyPlace> = await res.json()
        const items = normalizeToArray(json.response?.body?.items?.item)
        setPopularPlaces(items)
      } catch (err) {
        console.error('인기 장소 불러오기 실패:', err)
      }
    }
    fetchPopular()
  }, [data, API_KEY])

  const handleAddPlaceClick = () => {
    if (!data || !id || !typeid) return
    setSelectedPlace({
      contentid: Number(id),
      contenttypeid: Number(typeid),
      title: data.title,
      firstimage: data.images[0],
      addr1: data.addr1,
      mapx: data.mapx,
      mapy: data.mapy,
    })
  }

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }, [])

  const makeSecureUrl = (url?: string | null): string | null => {
    if (!url) return null
    try {
      const s = String(url).trim()
      if (s.startsWith('https://')) return s
      if (s.startsWith('//')) return 'https:' + s
      if (s.startsWith('http://')) return s.replace(/^http:\/\//i, 'https://')
      return s
    } catch {
      return url
    }
  }

  const extractImgUrl = (htmlOrUrl?: string | null): string | null => {
    if (!htmlOrUrl) return null
    const str = String(htmlOrUrl)
    const imgMatch = str.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (imgMatch) return imgMatch[1]
    const urlMatch = str.match(/https?:\/\/[^\s'"]+/i)
    return urlMatch ? urlMatch[0] : null
  }

  // HTML의 <br>을 실제 줄바꿈으로 바꾸고 나머지 태그는 제거, &nbsp; 등 간단 치환
  const formatWithLineBreaks = (raw?: string | null | undefined) => {
    if (!raw && raw !== '') return '정보 없음'
    try {
      let s = String(raw)
      // <br> 계열을 줄바꿈으로 변경
      s = s.replace(/<br\s*\/?>/gi, '\n')
      // 나머지 HTML 태그 제거
      s = s.replace(/<[^>]+>/g, '')
      // HTML 엔티티 일부 치환 (필요 시 추가)
      s = s.replace(/&nbsp;/gi, ' ')
      s = s.trim()
      return s === '' ? '정보 없음' : s
    } catch {
      return String(raw)
    }
  }
  useCallback(() => {
    if (!data?.extraIntro) return []
    const urls: string[] = []
    for (let i = 1; i <= 6; i++) {
      const key = `roomimg${i}`
      const raw = data.extraIntro[key]
      if (!raw) continue
      const src = extractImgUrl(raw)
      if (src) urls.push(makeSecureUrl(src) || src)
    }
    const fallbackKeys = ['roomimg', 'roomimage', 'roomphoto']
    for (const k of fallbackKeys) {
      if (data.extraIntro[k]) {
        const raw = data.extraIntro[k]
        const src = extractImgUrl(raw)
        if (src) urls.push(makeSecureUrl(src) || src)
      }
    }
    return Array.from(new Set(urls)).filter(Boolean)
  }, [data?.extraIntro])
  const handlePrev = useCallback(() => {
    const currentGallery = galleryImages
    if (currentGallery.length === 0) return
    const prevIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length
    setCurrentIndex(prevIndex)
    setSelectedImage(currentGallery[prevIndex])
  }, [currentIndex, galleryImages])

  const handleNext = useCallback(() => {
    const currentGallery = galleryImages
    if (currentGallery.length === 0) return
    const nextIndex = (currentIndex + 1) % currentGallery.length
    setCurrentIndex(nextIndex)
    setSelectedImage(currentGallery[nextIndex])
  }, [currentIndex, galleryImages])


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
      setRating(null)
      return
    }

    setMenusLoading(true)
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
        const res = await fetch(`https://port-0-planit-mcmt59q6ef387a77.sel5.cloudtype.app/api/menu?name=${encodeURIComponent(searchName)}`, { credentials: 'include' })
        const json: MenuResponse = await res.json()
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

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`
    script.async = true
    script.onload = () => setIsMapScriptLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Naver Maps script')
      setError('지도 스크립트를 불러오지 못했습니다.')
    }
    document.head.appendChild(script)

    return () => {
      const existingScript = document.querySelector(`script[src*="${NAVER_MAP_CLIENT_ID}"]`)
      if (existingScript) {
        document.head.removeChild(existingScript)
      }
    }
  }, [NAVER_MAP_CLIENT_ID])

  useEffect(() => {
    if (!isMapScriptLoaded || !data?.mapx || !data.mapy || !mapRef.current) return

    const { naver } = window
    if (!naver) return

    const placeLocation = new naver.maps.LatLng(data.mapy, data.mapx)
    let distanceLabelMarker: any = null

    const initializeMap = (myLocation?: any) => {
      const bounds = new naver.maps.LatLngBounds()
      bounds.extend(placeLocation)
      if (myLocation) {
        bounds.extend(myLocation)
      }

      const map = new naver.maps.Map(mapRef.current!, {
        center: myLocation ? bounds.getCenter() : placeLocation,
        zoom: 10,
      })
      mapInstance.current = map

      new naver.maps.Marker({ position: placeLocation, map, title: data.title })

      if (myLocation) {
        new naver.maps.Marker({ position: myLocation, map, title: '내 위치' })
        new naver.maps.Polyline({
          map: map,
          path: [placeLocation, myLocation],
          strokeColor: '#5347AA',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          zIndex: 10,
        })

        naver.maps.Event.once(map, 'idle', () => {
          map.fitBounds(bounds, { padding: 50 })
        })

        const projection = map.getProjection()
        const calculatedDistance = projection.getDistance(placeLocation, myLocation)
        setDistance(calculatedDistance)

        const midPoint = new naver.maps.LatLng((placeLocation.y + myLocation.y) / 2, (placeLocation.x + myLocation.x) / 2)
        const distanceText = `${(calculatedDistance / 1000).toFixed(2)}km`

        distanceLabelMarker = new naver.maps.Marker({
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
          const myLocation = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude)
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

    const handleResize = () => mapInstance.current?.relayout?.()
    window.addEventListener('resize', handleResize)

    const observer = new window.MutationObserver(() => {
      mapInstance.current?.relayout?.()
    })
    if (mapRef.current) {
      observer.observe(mapRef.current, { attributes: true, childList: true, subtree: true })
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      if (distanceLabelMarker) {
        distanceLabelMarker.setMap(null)
      }
    }
  }, [isMapScriptLoaded, data])

  useEffect(() => {
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown)
    else window.removeEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, handleKeyDown])

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id || !typeid) {
        setError('ID 또는 타입 정보가 없습니다.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        const commonUrl = `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=${API_KEY}&MobileOS=ETC&MobileApp=TestAPP&_type=json&contentId=${id}`
        const imageUrl = `https://apis.data.go.kr/B551011/KorService2/detailImage2?serviceKey=${API_KEY}&MobileOS=ETC&MobileApp=TestAPP&_type=json&contentId=${id}&imageYN=Y&numOfRows=100`
        const introUrl = `https://apis.data.go.kr/B551011/KorService2/detailIntro2?serviceKey=${API_KEY}&MobileOS=ETC&MobileApp=TestAPP&_type=json&contentId=${id}&contentTypeId=${typeid}`

        const [commonRes, imageRes, introRes] = await Promise.all([fetch(commonUrl), fetch(imageUrl), fetch(introUrl)])

        const commonJson: TourAPIBaseResponse<DetailCommonItem> = await commonRes.json()
        const imageJson: TourAPIBaseResponse<ImageItem> = await imageRes.json()
        const introJson: TourAPIBaseResponse<DetailIntroItem> = await introRes.json()

        const item = normalizeToArray(commonJson.response?.body?.items?.item)[0]
        const imageUrls = normalizeToArray(imageJson.response?.body?.items?.item)
          .map((i) => i.originimgurl)
          .filter(Boolean)
        const introItem = normalizeToArray(introJson.response?.body?.items?.item)[0] || {}

        if (!item) {
          setError('상세 정보를 불러올 수 없습니다.')
          setLoading(false)
          return
        }

        let lodgingItem: LodgingInfoItem = {}
        let finalCourseSpots: (CourseInfoItem & { detail: DetailCommonItem | null })[] = []

        if (typeid === '32') {
          // 숙박
          const lodgingInfoUrl = `https://apis.data.go.kr/B551011/KorService2/detailInfo2?serviceKey=${API_KEY}&MobileOS=ETC&MobileApp=TestAPP&_type=json&contentId=${id}&contentTypeId=${typeid}`
          try {
            const lodgingRes = await fetch(lodgingInfoUrl)
            const lodgingInfoJson: TourAPIBaseResponse<LodgingInfoItem> = await lodgingRes.json()
            lodgingItem = normalizeToArray(lodgingInfoJson.response?.body?.items?.item)[0] || {}
          } catch (err) {
            console.error('숙박 상세 info 불러오기 실패:', err)
          }
        } else if (typeid === '25') {
          // 여행 코스
          const infoUrl = `https://apis.data.go.kr/B551011/KorService2/detailInfo2?serviceKey=${API_KEY}&MobileOS=ETC&MobileApp=TestAPP&_type=json&contentId=${id}&contentTypeId=${typeid}`
          try {
            const infoRes = await fetch(infoUrl)
            const infoJson: TourAPIBaseResponse<CourseInfoItem> = await infoRes.json()
            const courseInfoItems = normalizeToArray(infoJson.response?.body?.items?.item)

            finalCourseSpots = await Promise.all(
              courseInfoItems.map(async (spot) => {
                if (!spot.subcontentid) return { ...spot, detail: null }
                const spotUrl = `https://apis.data.go.kr/B551011/KorService2/detailCommon2?serviceKey=${API_KEY}&MobileOS=ETC&MobileApp=TestAPP&_type=json&contentId=${spot.subcontentid}`
                try {
                  const res = await fetch(spotUrl)
                  const json: TourAPIBaseResponse<DetailCommonItem> = await res.json()
                  const detailItem = normalizeToArray(json.response?.body?.items?.item)[0]
                  return { ...spot, detail: detailItem || null }
                } catch {
                  return { ...spot, detail: null }
                }
              }),
            )
            setCourseSpots(finalCourseSpots.filter((spot): spot is CourseSpotItem => !!spot))
          } catch (err) {
            console.error('여행코스 상세 info 불러오기 실패:', err)
          }
        }

        const mergedIntro: ExtraIntroData = { ...introItem, ...lodgingItem }
        const contentTypeId = Number(typeid)
        let tel = '',
          usetime = '',
          usefee = ''

        switch (contentTypeId) {
          case 12:
            tel = mergedIntro?.infocenter || ''
            usetime = mergedIntro?.usetime || ''
            usefee = mergedIntro?.usefee || ''
            break
          case 14:
            tel = mergedIntro?.infocenterculture || ''
            usetime = mergedIntro?.usetimeculture || ''
            usefee = mergedIntro?.usefee || ''
            break
          case 15:
            tel = mergedIntro?.sponsor1tel || ''
            usetime = mergedIntro?.playtime || ''
            usefee = mergedIntro?.usetimefestival || ''
            break
          case 25:
            tel = mergedIntro?.infocentertourcourse || ''
            usetime = mergedIntro?.taketime || ''
            break
          case 28:
            tel = mergedIntro?.infocenterleports || ''
            usetime = mergedIntro?.usetimeleports || ''
            break
          case 32:
            tel = mergedIntro?.infocenterlodging || ''
            usetime = `체크인: ${mergedIntro?.checkintime || '정보 없음'}, 체크아웃: ${mergedIntro?.checkouttime || '정보 없음'}`
            break
          case 39:
            tel = mergedIntro?.infocenterfood || ''
            usetime = mergedIntro?.opentimefood || ''
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
          extraIntro: mergedIntro,
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

  // 캐러셀에 전달할 데이터 형식으로 변환
  const carouselSlides = data.images.map((url, i) => ({
    src: url,
  }));

  const handleImageClickForModal = (index: number) => {
    setGalleryImages(data.images);
    setCurrentIndex(index);
    setSelectedImage(data.images[index]);
    setIsModalOpen(true);
  };

  const rawHomepage = data.homepage || ''
  const regex = /href="([^"]+)"[^>]*>([^<]+)<\/a>/
  const match = rawHomepage.match(regex)
  const homepageUrl = match ? match[1] : rawHomepage
  const homepageText = match ? match[2] : rawHomepage

  const renderInfoCard = () => {
    switch (data.contentTypeId) {
      case 12: // 관광지
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FaTree /> 관광 정보</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaRegClock /> 이용시간</span><span className={styles.infoValue}>{formatWithLineBreaks(data.usetime)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCalendarAlt /> 쉬는날</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.restdate)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaParking /> 주차</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.parking)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaDog /> 애완동물</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.chkpet)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCreditCard /> 신용카드</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.chkcreditcard)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaPhone /> 문의</span><span className={styles.infoValue}>{formatWithLineBreaks(data.tel)}</span></div>
            </div>
          </div>
        );
      case 14: // 문화시설
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FaBuilding /> 문화시설 정보</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaRegClock /> 이용시간</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.usetimeculture)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCalendarAlt /> 쉬는날</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.restdateculture)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaTicketAlt /> 관람소요시간</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.spendtime)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaParking /> 주차요금</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.parkingfee)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaDog /> 애완동물</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.chkpetculture)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaMoneyBillWave /> 이용요금</span><span className={styles.infoValue}>{formatWithLineBreaks(data.usefee)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaPhone /> 문의</span><span className={styles.infoValue}>{formatWithLineBreaks(data.tel)}</span></div>
              {homepageUrl && <div className={styles.infoItem}><span className={styles.infoLabel}><FaHome /> 홈페이지</span><span className={styles.infoValue}><a href={homepageUrl} target="_blank" rel="noopener noreferrer">{homepageText}</a></span></div>}
            </div>
          </div>
        );
      case 15: // 행사/공연
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FaFilm /> 행사 정보</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCalendarAlt /> 행사기간</span><span className={styles.infoValue}>{`${formatWithLineBreaks(data.extraIntro.eventstartdate)} ~ ${formatWithLineBreaks(data.extraIntro.eventenddate)}`}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaRegClock /> 공연시간</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.playtime)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaMoneyBillWave /> 이용요금</span><span className={styles.infoValue}>{formatWithLineBreaks(data.usefee)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaMapMarkedAlt /> 행사장소</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.eventplace)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaPhone /> 주최자문의</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.sponsor1tel)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaPhone /> 주관사문의</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.sponsor2tel)}</span></div>
              {homepageUrl && <div className={styles.infoItem}><span className={styles.infoLabel}><FaHome /> 홈페이지</span><span className={styles.infoValue}><a href={homepageUrl} target="_blank" rel="noopener noreferrer">{homepageText}</a></span></div>}
            </div>
          </div>
        );
      case 28: // 레포츠
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FaTicketAlt /> 레포츠 정보</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCalendarAlt /> 개장기간</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.openperiod)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaRegClock /> 이용시간</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.usetimeleports)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaBaby /> 체험가능연령</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.expagerangeleports)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaParking /> 주차시설</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.parkingleports)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaMoneyBillWave /> 주차요금</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.parkingfeeleports)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCalendarAlt /> 쉬는날</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.restdateleports)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaMoneyBillWave /> 입장료</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.usefeeleports)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaPhone /> 문의</span><span className={styles.infoValue}>{formatWithLineBreaks(data.tel)}</span></div>
              {homepageUrl && <div className={styles.infoItem}><span className={styles.infoLabel}><FaHome /> 홈페이지</span><span className={styles.infoValue}><a href={homepageUrl} target="_blank" rel="noopener noreferrer">{homepageText}</a></span></div>}
            </div>
          </div>
        );
      case 32: // 숙박
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FaBed /> 숙박 정보</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>객실명칭</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro?.roomtitle)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>체크인</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.checkintime)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>체크아웃</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.checkouttime)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>예약</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.reservationlodging)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaParking /> 주차</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.parkinglodging)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>객실크기</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.roomsize1 ? `${data.extraIntro.roomsize1}평` : undefined)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>객실수</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.roomcount)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>기준인원</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.roombasecount)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>최대인원</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.roommaxcount)}</span></div>
              {homepageUrl && <div className={styles.infoItem}><span className={styles.infoLabel}><FaHome /> 홈페이지</span><span className={styles.infoValue}><a href={homepageUrl} target="_blank" rel="noopener noreferrer">{homepageText}</a></span></div>}
            </div>
          </div>
        );
      case 38: // 쇼핑
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FaShoppingBag /> 쇼핑 정보</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCalendarAlt /> 장서는날</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.fairday)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaRegClock /> 영업시간</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.opentime)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCalendarAlt /> 쉬는날</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.restdateshopping)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaGift /> 판매품목</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.saleitem)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaMoneyBillWave /> 품목별가격</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.saleitemcost)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCreditCard /> 신용카드</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.chkcreditcardshopping)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaDog /> 애완동물</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.chkpetshopping)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaInfoCircle /> 매장안내</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.shopguide)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaPhone /> 문의</span><span className={styles.infoValue}>{formatWithLineBreaks(data.tel)}</span></div>
            </div>
          </div>
        );
      case 39: // 음식점
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FaUtensils /> 식당 정보</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaRegClock /> 영업시간</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.opentimefood)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCalendarAlt /> 쉬는날</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.restdatefood)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>대표메뉴</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.firstmenu)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>취급메뉴</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.treatmenu)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>포장</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.packing)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaParking /> 주차</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.parkingfood)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaCreditCard /> 신용카드</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.chkcreditcardfood)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>예약</span><span className={styles.infoValue}>{formatWithLineBreaks(data.extraIntro.reservationfood)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaPhone /> 문의</span><span className={styles.infoValue}>{formatWithLineBreaks(data.tel)}</span></div>
            </div>
          </div>
        );
      case 25: // 여행코스
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FaRoute/> 코스별 주요 장소</h2>
            <ul className={styles.courseSpotsList}>
              {courseSpots.map((spot, idx) => (
                <li key={spot.subcontentid || idx} className={styles.courseSpotItem}>
                  <Link to={`/detail/${spot.subcontentid}/${spot.detail?.contenttypeid || ''}`} className={styles.courseSpotLink}>
                    <img src={spot.detail?.firstimage || spot.subdetailimg || '/noimage.jpg'} alt={spot.subname || spot.detail?.title || ''} className={styles.courseSpotImg} />
                    <div className={styles.courseSpotInfo}>
                      <strong>{spot.subname || spot.detail?.title || '장소명 없음'}</strong>
                      <p className={styles.courseSpotDesc}>{formatWithLineBreaks(spot.subdetailoverview).substring(0, 100)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      // ... 다른 케이스들 추가
      default:
        return (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}><FaInfoCircle /> 기본 정보</h2>
            <div className={styles.infoList}>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaRegClock /> 운영시간</span><span className={styles.infoValue}>{formatWithLineBreaks(data.usetime)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaMoneyBillWave /> 입장료</span><span className={styles.infoValue}>{formatWithLineBreaks(data.usefee)}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}><FaPhone /> 연락처</span><span className={styles.infoValue}>{formatWithLineBreaks(data.tel)}</span></div>
              {homepageUrl && <div className={styles.infoItem}><span className={styles.infoLabel}><FaHome /> 홈페이지</span><span className={styles.infoValue}><a href={homepageUrl} target="_blank" rel="noopener noreferrer">{homepageText}</a></span></div>}
            </div>
          </div>
        );
    }
  };


  // 카테고리 라벨 반환 함수
  function getCategoryLabel(typeId: number) {
    switch (typeId) {
      case 12: return '관광지';
      case 14: return '문화시설';
      case 15: return '행사/공연';
      case 25: return '여행코스';
      case 28: return '레포츠';
      case 32: return '숙박';
      case 38: return '쇼핑';
      case 39: return '음식점';
      default: return '기타';
    }
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>
            {data.title}
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 500,
              color: '#007fff',
              marginLeft: '16px',
              background: '#f0f7ff',
              borderRadius: '8px',
              padding: '4px 12px',
              verticalAlign: 'middle',
            }}>
              {getCategoryLabel(data.contentTypeId)}
            </span>
          </h1>
          <p className={styles.address}>{data.addr1 || '주소 정보 없음'}</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.addButton} onClick={handleAddPlaceClick}>
            일정 추가
          </button>
        </div>
      </header>

      <div className={styles.heroImageWrapper}>
        {carouselSlides.length > 0 ? (
          <Carousel slides={carouselSlides} onImageClick={handleImageClickForModal} />
        ) : (
          <img src="/noimage.jpg" alt="이미지 없음" className={styles.heroImage} />
        )}
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <FaInfoCircle /> 상세 설명
            </h2>
            <div className={styles.overviewContent}>{data.overview ? formatWithLineBreaks(data.overview) : '설명 정보 없음'}</div>
          </div>

          {renderInfoCard()}

          {nearbyPlaces.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>주변 추천 장소</h2>
              <div className={styles.recommendList}>
                {nearbyPlaces.slice(0, 4).map((place) => (
                  <Link key={place.contentid} to={`/detail/${place.contentid}/${place.contenttypeid}`} className={styles.recommendCard}>
                    <img src={place.firstimage || '/noimage.jpg'} alt={place.title} className={styles.recommendImage} />
                    <div className={styles.recommendTitle}>{place.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <FaMapMarkedAlt /> 위치 정보
            </h2>
            <div ref={mapRef} className={styles.mapBox}></div>
            {distance !== null && <div className={styles.distanceInfo}>현재 위치와의 직선 거리: {(distance / 1000).toFixed(2)}km</div>}
          </div>

          {data.contentTypeId === 39 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}><FaUtensils /> 대표 메뉴</h2>
              {rating && (
                <div className={styles.menuRatingBox}>
                  <FaStar color="#f5b50a" />
                  <span className={styles.ratingValue}>{rating}</span>
                  <span className={styles.ratingLabel}>평점</span>
                </div>
              )}
              {menusLoading ? (
                <div>메뉴 탐색중...</div>
              ) : menus && menus.length > 0 ? (
                <ul className={styles.menuList}>
                  {menus.map((menu, i) => (
                    <li key={i} className={styles.menuItem}>
                      <span className={styles.menuName}>{menu.name}</span>
                      <span className={styles.menuPrice}>{menu.price || ''}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.noMenu}>메뉴 정보가 없습니다.</div>
              )}
            </div>
          )}

          {popularPlaces.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🔥 이 지역 인기 장소</h2>
              <div className={styles.recommendList} style={{gridTemplateColumns: '1fr'}}>
                {popularPlaces.slice(0, 3).map((place) => (
                  <Link key={place.contentid} to={`/detail/${place.contentid}/${place.contenttypeid}`} className={styles.recommendCard}>
                    <img src={place.firstimage || '/noimage.jpg'} alt={place.title} className={styles.recommendImage} />
                    <div className={styles.recommendTitle}>{place.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedPlace && <AddPlaceModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />}
    </div>
  )
}

export default DetailPage