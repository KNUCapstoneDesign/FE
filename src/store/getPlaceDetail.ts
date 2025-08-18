// src/api/getPlaceDetail.ts
import { Place } from '../store/useMyTravelStore'

// 환경변수에서 API 키 가져오기 (VITE 접두사 필수)
const SERVICE_KEY = import.meta.env.VITE_API_KEY1

export const getPlaceDetail = async (contentid: number): Promise<Partial<Place>> => {
  try {
    const encodedKey = encodeURIComponent(SERVICE_KEY)

    const res = await fetch(
      `https://apis.data.go.kr/B551011/KorService2/detailCommon2?ServiceKey=${encodedKey}&MobileOS=ETC&MobileApp=Test&_type=json&contentId=${contentid}&defaultYN=Y&overviewYN=Y&addrinfoYN=Y`,
    )

    if (!res.ok) {
      console.error(`TourAPI 응답 실패: ${res.status} ${res.statusText}`)
      return {}
    }

    const json = await res.json()
    const item = json?.response?.body?.items?.item?.[0]

    if (!item) {
      console.warn(`TourAPI 응답에 item 없음 - contentid: ${contentid}`, json)
      return {}
    }

    return {
      contentid,
      title: item.title,
      contenttypeid: item.contenttypeid,
      firstimage: item.firstimage,
      addr1: item.addr1,
      overview: item.overview,
      mapx: item.mapx,
      mapy: item.mapy,
    }
  } catch (err) {
    console.error(`TourAPI 요청 실패 - contentid: ${contentid}`, err)
    return {}
  }
}
