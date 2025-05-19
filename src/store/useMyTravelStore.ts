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
  id: string // '제목-시작일' 조합으로 구성
  title: string
  startDate: string
  endDate: string
  items: Place[]
  created?: string
}

interface MyTravelState {
  courses: TravelCourse[]
  addCourse: (title: string, startDate: string, endDate: string) => void
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
      addCourse: (title, startDate, endDate) => {
        const id = `${title}-${startDate}`
        const exists = get().courses.some((c) => c.id === id)
        if (exists) return

        const newCourse: TravelCourse = {
          id,
          title,
          startDate,
          endDate,
          items: [],
        }
        set((state) => ({ courses: [...state.courses, newCourse] }))
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
