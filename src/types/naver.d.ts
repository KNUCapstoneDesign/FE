// src/types/naver.d.ts
export {}

declare global {
  interface Window {
    naver: typeof naver
  }

  namespace naver {
    namespace maps {
      /**
       * 위도/경도 좌표를 나타냅니다.
       */
      class LatLng {
        constructor(lat: number, lng: number)
      }

      /**
       * 네이버 지도 객체입니다.
       */
      class Map {
        constructor(
          element: HTMLElement,
          options: {
            /** 지도의 초기 중심 좌표 */
            center: LatLng
            /** 지도의 초기 확대 레벨 */
            zoom: number
          },
        )
        /**
         * 지도의 중심을 지정된 좌표로 즉시 이동합니다.
         */
        setCenter(center: LatLng): void
        /**
         * 지도의 중심을 부드럽게 이동합니다.
         */
        panTo(center: LatLng): void
        /** 지도 메모리 해제 메서드 (비공식) */
        destroy?(): void
      }

      /**
       * 지도 위에 표시되는 마커 객체입니다.
       */
      class Marker {
        constructor(options: { position: LatLng; map: Map })
        /**
         * 마커를 특정 지도에 추가하거나 제거합니다.
         * @param map 마커를 표시할 지도 객체 또는 null (제거)
         */
        setMap(map: Map | null): void
      }
    }
  }
}
