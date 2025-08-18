import React, { useEffect, useState } from 'react'
import styles from '../assets/AreaSelectModal.module.css'

const API_KEY = import.meta.env.VITE_API_KEY1

interface AreaSelectModalProps {
  open: boolean
  onClose: () => void
  onSelect: (areaCode: string, sigunguCode?: string, sigunguName?: string) => void
  selectedAreaCode: string
  selectedDistrict?: string
}

interface AreaItem {
  code: string
  name: string
}

interface SigunguItem {
  code: string
  name: string
}

interface TourAPIItem {
  code: number
  name: string
}

const AreaSelectModal: React.FC<AreaSelectModalProps> = ({ open, onClose, onSelect, selectedAreaCode, selectedDistrict }) => {
  const [areaCode, setAreaCode] = useState(selectedAreaCode)
  const [sigunguCode, setSigunguCode] = useState<string | undefined>(selectedDistrict)
  const [areaList, setAreaList] = useState<AreaItem[]>([])
  const [districtList, setDistrictList] = useState<SigunguItem[]>([])

  useEffect(() => {
    setAreaCode(selectedAreaCode)
    setSigunguCode(selectedDistrict)
  }, [selectedAreaCode, selectedDistrict, open])

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch(`https://apis.data.go.kr/B551011/KorService2/areaCode2?serviceKey=${API_KEY}&numOfRows=17&MobileOS=ETC&MobileApp=AppTest&_type=json`)
        const json = await res.json()
        const items = json.response?.body?.items?.item || []
        const result: TourAPIItem[] = Array.isArray(items) ? items : [items]
        setAreaList([{ code: '', name: '전체 지역' }, ...result.map((a) => ({ code: String(a.code), name: a.name }))])
      } catch (e) {
        console.error('시도 목록 로딩 실패:', e)
        setAreaList([{ code: '', name: '전체 지역' }])
      }
    }
    fetchAreas()
  }, [])

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!areaCode) {
        setDistrictList([])
        return
      }
      try {
        const res = await fetch(`https://apis.data.go.kr/B551011/KorService2/areaCode2?serviceKey=${API_KEY}&numOfRows=50&areaCode=${areaCode}&MobileOS=ETC&MobileApp=AppTest&_type=json`)
        const json = await res.json()
        const items = json.response?.body?.items?.item || []
        const result: TourAPIItem[] = Array.isArray(items) ? items : [items]
        setDistrictList(result.map((d) => ({ code: String(d.code), name: d.name })))
      } catch (e) {
        console.error('시군구 목록 로딩 실패:', e)
        setDistrictList([])
      }
    }
    fetchDistricts()
  }, [areaCode])

  if (!open) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span>지역 선택</span>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.bodyContainer}>
          <div className={styles.areaList}>
            {areaList.map((a) => (
              <button
                key={a.code}
                className={`${styles.areaButton} ${areaCode === a.code ? styles.active : ''}`}
                onClick={() => {
                  setAreaCode(a.code)
                  setSigunguCode(undefined)
                }}>
                {a.name}
              </button>
            ))}
          </div>

          <div className={styles.districtList}>
            {districtList.length > 0 ? (
              districtList.map((d) => (
                <button key={d.code} className={`${styles.districtButton} ${sigunguCode === d.code ? styles.active : ''}`} onClick={() => setSigunguCode(d.code)}>
                  {d.name}
                </button>
              ))
            ) : (
              <span className={styles.emptyDistrict}>구/군 없음</span>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.confirmButton}
            onClick={() => {
              const selectedDistrict = districtList.find((d) => d.code === sigunguCode)
              onSelect(areaCode, sigunguCode, selectedDistrict?.name)
              onClose()
            }}>
            확인
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default AreaSelectModal
