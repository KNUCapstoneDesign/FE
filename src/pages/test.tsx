// src/pages/test.tsx
import React, { useEffect, useState } from 'react'
import MainLoading from '../components/MainLoading.tsx'

interface TourItem {
  title: string
  addr1: string
  firstimage: string
  contentid: string
}

const contentTypeMap: { [key: number]: string } = {
  12: '관광지',
  14: '문화시설',
  15: '축제/공연/행사',
  25: '여행코스',
}

const TestPage: React.FC = () => {
  const [tourData, setTourData] = useState<{ [key: number]: TourItem[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_KEY = import.meta.env.VITE_API_KEY1

  useEffect(() => {
    const fetchCategoryData = async (contentTypeId: number) => {
      const url = `https://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${API_KEY}&numOfRows=5&pageNo=2&MobileOS=ETC&MobileApp=TestApp&_type=json&contentTypeId=${contentTypeId}&areaCode=1`
      const response = await fetch(url)
      const json = await response.json()
      return json.response.body.items.item
    }

    const fetchAllData = async () => {
      try {
        const newData: { [key: number]: TourItem[] } = {}
        for (const contentTypeId of Object.keys(contentTypeMap).map(Number)) {
          const items = await fetchCategoryData(contentTypeId)
          newData[contentTypeId] = items
        }
        setTourData(newData)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(`API 호출 실패: ${err.message}`)
        } else {
          setError('API 호출 실패!')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [API_KEY])

  if (loading) return <MainLoading/>
  if (error) return <p>{error}</p>

  return (
    <div style={{ padding: '20px' }}>
      <h1>📌 카테고리별 Tour API 테스트</h1>
      {Object.entries(contentTypeMap).map(([id, name]) => (
        <div key={id} style={{ marginBottom: '40px' }}>
          <h2>📂 {name}</h2>
          <ul>
            {(tourData[Number(id)] || []).map((item) => (
              <li key={item.contentid} style={{ marginBottom: '10px' }}>
                <strong>{item.title}</strong>
                <br />
                <span>{item.addr1}</span>
                <br />
                {item.firstimage && <img src={item.firstimage} alt={item.title} width={200} />}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default TestPage
