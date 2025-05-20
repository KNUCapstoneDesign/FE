import React, { useState, useMemo } from 'react'
import { useMyTravelStore, Place } from '../store/useMyTravelStore'
import styles from '../assets/AiSearchPage.module.css'

interface AddPlaceModalProps {
  place: Place
  onClose: () => void
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ place, onClose }) => {
  const { courses, addPlaceToCourse } = useMyTravelStore()
  const [selectedCourseId, setSelectedCourseId] = useState<string>('')
  const [showAlert, setShowAlert] = useState(false)
  const [day, setDay] = useState('1')
  const [time, setTime] = useState('')

  // 선택한 일정 객체 찾기
  const selectedCourse = useMemo(() => courses.find((course) => course.id === selectedCourseId), [courses, selectedCourseId])

  // Day 드롭다운에 들어갈 총 일수 계산
  const courseDays = useMemo(() => {
    if (selectedCourse && selectedCourse.startDate && selectedCourse.endDate) {
      const start = new Date(selectedCourse.startDate)
      const end = new Date(selectedCourse.endDate)
      // 날짜 차이 + 1 (ex. 2024-05-20~2024-05-22 → 3일)
      return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) + 1))
    }
    return 7 // 기본값
  }, [selectedCourse])

  // 일정이 바뀌면 day를 1로 리셋
  React.useEffect(() => {
    setDay('1')
  }, [selectedCourseId])

  const handleAdd = () => {
    if (selectedCourseId) {
      addPlaceToCourse(selectedCourseId, {
        ...place,
        day: `Day ${day}`,
        time: time,
      })
      setShowAlert(true)
      setTimeout(() => {
        setShowAlert(false)
        onClose()
      }, 2000)
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
                  {course.title} {course.startDate} ~ {course.endDate}
                </option>
              ))}
            </select>
            {/* Day/시간 입력란 */}
            <div style={{ display: 'flex', gap: 12, width: '100%', margin: '10px 0' }}>
              <label>
                Day:
                <select value={day} onChange={(e) => setDay(e.target.value)} style={{ width: 110, marginLeft: 4 }}>
                  {Array.from({ length: courseDays }, (_, i) => (
                    <option value={String(i + 1)} key={i + 1}>
                      {i + 1}일차
                    </option>
                  ))}
                </select>
              </label>
              <label>
                시간:
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ marginLeft: 4, width: 110 }} />
              </label>
            </div>
          </>
        )}

        {/* alert 위치 - 버튼 위에 자연스럽게 */}
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
