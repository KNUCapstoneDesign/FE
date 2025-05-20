import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Place {
  contentid: number
  contenttypeid: number
  title: string
  firstimage?: string
  addr1?: string
  mapx?: number
  mapy?: number
  duration?: string
  usetime?: string
  usefee?: string
  overview?: string
}

export interface TravelCourse {
  id?: string // (optional) DB에서 자동 생성된 schedule_id를 사용할 예정
  title: string
  startDate: string
  endDate: string
  items: Place[]
  created?: string
}

interface MyTravelState {
  courses: TravelCourse[]
  addCourse: (title: string, startDate: string, endDate: string, userId: number) => void
  addPlaceToCourse: (courseId: string, place: Place) => void
  removePlaceFromCourse: (courseId: string, contentid: number) => void
  removeCourse: (courseId: string) => void
  updateCourseTitle: (id: string, newTitle: string) => void
}

export const useMyTravelStore = create<MyTravelState>()(
  persist(
    (set, get) => ({
      courses: [],

      // 1. 일정(코스) 추가
      addCourse: async (title, startDate, endDate, userId) => {
        const id = `${title}-${startDate}`
        const exists = get().courses.some((c) => c.id === id)
        if (exists) return

        try {
          const res = await fetch('http://localhost:5001/api/schedules', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: userId,
              title,
              start_date: startDate,
              end_date: endDate,
            }),
          })

          const saved = await res.json()
          const newCourse: TravelCourse = {
            id: saved.schedule_id.toString() || undefined,
            title,
            startDate,
            endDate,
            items: [],
            created: saved.created_at || undefined,
          }
          set((state) => ({ courses: [...state.courses, newCourse] }))
        } catch (err) {
          console.error('일정 서버 저장 실패:', err)
        }
      },

      // 2. 장소를 특정 일정에 추가
      addPlaceToCourse: (courseId, place) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  items: course.items.some((p) => p.contentid === place.contentid) ? course.items : [...course.items, place],
                }
              : course,
          ),
        }))
      },

      // 3. 장소 제거
      removePlaceFromCourse: (courseId, contentid) => {
        set((state) => ({
          courses: state.courses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  items: course.items.filter((p) => p.contentid !== contentid),
                }
              : course,
          ),
        }))
      },

      // 4. 전체 일정(코스) 제거
      removeCourse: (courseId) => {
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== courseId),
        }))
      },

      // 5. 일정 타이틀 변경
      updateCourseTitle: (id: string, newTitle: string) =>
        set((state) => ({
          courses: state.courses.map((course) => (course.id === id ? { ...course, title: newTitle } : course)),
        })),
    }),
    { name: 'my-travel-courses' },
  ),
)
