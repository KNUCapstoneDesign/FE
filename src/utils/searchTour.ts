// src/utils/searchTour.ts

export interface TourItem {
  contentid: number
  title: string
  firstimage?: string
  addr2?: string
  contenttypeid: number
  overview?: string
  tel?: string
  mapx?: number
  mapy?: number
}

export async function searchTour(keyword: string, contentTypeId?: string): Promise<TourItem[]> {
  const API_KEY = import.meta.env.VITE_API_KEY1!
  const serviceKey = decodeURIComponent(API_KEY)
  const TOUR_BASE = '/api/tour'; // 프록시 사용
  const url = new URL(`${TOUR_BASE}/searchKeyword2`)
  url.searchParams.set('serviceKey', serviceKey)
  url.searchParams.set('MobileOS', 'ETC')
  url.searchParams.set('MobileApp', 'AppTest')
  url.searchParams.set('_type', 'json')
  url.searchParams.set('keyword', keyword)
  url.searchParams.set('numOfRows', '1000')

  if (contentTypeId) {
    url.searchParams.set('contentTypeId', contentTypeId)
  }

  const res = await fetch(url.toString())
  const data = await res.json()
  const items = data?.response?.body?.items?.item

  if (!items) return []

  return Array.isArray(items) ? items : [items]
}

export async function getTourDetail(contentId: number): Promise<TourItem> {
  const API_KEY = import.meta.env.VITE_API_KEY1!
  const serviceKey = decodeURIComponent(API_KEY)
  const TOUR_BASE = '/api/tour'; // 프록시 사용
  const url = new URL(`${TOUR_BASE}/detailCommon2`)
  url.searchParams.set('serviceKey', serviceKey)
  url.searchParams.set('MobileOS', 'ETC')
  url.searchParams.set('MobileApp', 'AppTest')
  url.searchParams.set('_type', 'json')
  url.searchParams.set('contentId', contentId.toString())
  url.searchParams.set('contentTypeId', '12')
  url.searchParams.set('defaultYN', 'Y')
  url.searchParams.set('overviewYN', 'Y')
  url.searchParams.set('addrinfoYN', 'Y')

  const res = await fetch(url.toString())
  const data = await res.json()
  const items = data?.response?.body?.items?.item

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('해당 장소에 대한 상세 정보가 없습니다.')
  }

  const item = items[0]

  return {
    contentid: item.contentid,
    title: item.title,
    firstimage: item.firstimage,
    addr2: item.addr2,
    overview: item.overview,
    tel: item.tel,
    contenttypeid: item.contenttypeid,
    mapx: parseFloat(item.mapx),
    mapy: parseFloat(item.mapy),
  }
}
