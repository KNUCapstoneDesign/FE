import React, { useState, useMemo } from 'react'
import { useMyTravelStore, Place } from '../store/useMyTravelStore'
import styles from '../assets/AiSearchPage.module.css'
import axios from 'axios'
import { useAuthStore } from '../store/useAuthStore.ts'

interface AddPlaceModalProps {
  place: Place
  onClose: () => void
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ place, onClose }) => {
  const { courses } = useMyTravelStore()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [showAlert, setShowAlert] = useState(false)
  const [day, setDay] = useState('1')
  const userId = useAuthStore((state) => state.userId)

  const selectedCourse = useMemo(() => courses.find((course) => course.id === selectedCourseId), [courses, selectedCourseId])

  const courseDays = useMemo(() => {
    if (selectedCourse && selectedCourse.startDate && selectedCourse.endDate) {
      const start = new Date(selectedCourse.startDate)
      const end = new Date(selectedCourse.endDate)
      return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1))
    }
    return 7
  }, [selectedCourse])

  const handleAdd = async () => {
    if (!selectedCourseId || !place.contentid) return

    try {
      await axios.post('http://localhost:5001/api/schedulespots', {
        user_id: userId,
        schedule_id: Number(selectedCourseId),
        day: Number(day),
        place_id: String(place.contentid),
        sequence: 1,
      })

      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
        onClose()
      }, 1000)
    } catch (err) {
      console.error('장소 추가 실패:', err)
      alert('장소 추가 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>어느 일정에 추가할까요?</h2>
        {courses.length === 0 ? (
          <p>
            생성된 일정이 없습니다.
            <br />
            먼저 일정을 추가해주세요.
          </p>
        ) : (
          <>
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className={styles.modalSelect}>
              <option value="">일정을 선택하세요</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} {course.startDate.slice(0, 10)} ~ {course.endDate.slice(0, 10)}
                </option>
              ))}
            </select>

            <div className={styles.daylabel}>
              <label>
                Day:
                <select value={day} onChange={(e) => setDay(e.target.value)} style={{ width: 110, marginLeft: 4, fontSize: 15 }}>
                  {Array.from({ length: courseDays }, (_, i) => (
                    <option value={String(i + 1)} key={i + 1}>
                      {i + 1}일차
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        )}

        {showAlert && <div className={styles.successAlert}>일정에 추가되었습니다!</div>}

        <div className={styles.modalButtons}>
          <button className={styles.addBtn} onClick={handleAdd} disabled={!selectedCourseId}>
            추가하기
          </button>
          <button className={styles.cancelBtn} onClick={onClose} type="button">
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddPlaceModal
