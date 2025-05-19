// src/pages/MyTravelDetailPage.tsx
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMyTravelStore } from '../store/useMyTravelStore'
import styles from '../assets/MyTravelDetailPage.module.css'

const MyTravelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { courses } = useMyTravelStore()
  const course = courses.find((c) => c.id === id)
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedPlace, setSelectedPlace] = useState(() => course?.items[0])

  useEffect(() => {
    if (!selectedPlace || !selectedPlace.mapy || !selectedPlace.mapx) return

    const script = document.createElement('script')
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}`
    script.async = true
    script.onload = () => {
      const naver = window.naver
      if (!naver || !mapRef.current) return

      const map = new naver.maps.Map(mapRef.current, {
        center: new naver.maps.LatLng(selectedPlace.mapy!, selectedPlace.mapx!),
        zoom: 14,
      })
      new naver.maps.Marker({
        position: new naver.maps.LatLng(selectedPlace.mapy!, selectedPlace.mapx!),
        map,
      })
    }

    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [selectedPlace])

  if (!course) return <div>일정 정보를 찾을 수 없습니다.</div>
  if (!selectedPlace) return <div>장소 정보를 불러오는 중입니다...</div>

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{course.title}</h1>
      <p className={styles.subtitle}>🗓 {course.date}</p>

      <img src={selectedPlace.firstimage || '/noimage.jpg'} className={styles.mainImage} alt={selectedPlace.title} />

      <div className={styles.infoContainer}>
        <div className={styles.basicInfo}>
          <h3>기본 정보</h3>
          <p>
            <strong>소요 시간:</strong> {selectedPlace.duration || '정보 없음'}
          </p>
          <p>
            <strong>주소:</strong> {selectedPlace.addr1 || '정보 없음'}
          </p>
        </div>
        <div className={styles.mapBox}>
          <h3>위치 정보</h3>
          <div ref={mapRef} className={styles.mapPlaceholder}></div>
        </div>
      </div>

      <div className={styles.detailDescription}>
        <h3>상세 설명</h3>
        <p>여행 일정에 포함된 주요 장소를 아래에서 확인하세요.</p>
      </div>

      <div className={styles.placeList}>
        {course.items.map((place, index) => (
          <div key={place.contentid} className={styles.placeCard} onClick={() => setSelectedPlace(place)}>
            <h4>
              {index + 1}. {place.title}
            </h4>
            <img src={place.firstimage || '/noimage.jpg'} alt={place.title} className={styles.placeImage} />
            <p>{place.overview || '소개 정보 없음'}</p>
            <div className={styles.meta}>
              <p>🕒 {place.usetime || '이용시간 정보 없음'}</p>
              <p>💰 {place.usefee || '이용요금 정보 없음'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyTravelDetailPage
