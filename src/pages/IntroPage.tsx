import SwipeLettersButton from '../components/SwipeLettersButton.tsx'

export default function IntroPage() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <img src={"/wallpaper.jpg"} alt="Intro" style={{ width: '100%', height: '100vh', objectFit: 'cover', position: 'absolute', top: 0, left: 0, zIndex: 0 }} />
      {/* 상단 그라데이션 오버레이 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '10%', /* 상단 20% 높이까지 그라데이션 적용 */
          background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))',
          zIndex: 1, /* 배경 이미지 위에, 콘텐츠 아래에 위치 */
          pointerEvents: 'none', /* 하위 요소 클릭 방지 해제 */
        }}
      ></div>

      {/* 하단 그라데이션 오버레이 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '10%', /* 하단 30% 높이까지 그라데이션 적용 */
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0))',
          zIndex: 1, /* 배경 이미지 위에, 콘텐츠 아래에 위치 */
          pointerEvents: 'none', /* 하위 요소 클릭 방지 해제 */
        }}
      ></div>

      <div style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, textAlign: 'center' }}>
        <h1 style={{ color: 'rgb(255,250,250)', fontSize: '3rem', fontWeight: 700, fontFamily: 'SeoulNamsan', marginBottom: '2rem', textShadow: '0 2px 16px rgba(0,0,0,0.3)' }}>
          여행을 떠나볼까요?
        </h1>
        <div style={{ display: 'inline-block', width: '70%' , marginTop: '20px'}}>
          <SwipeLettersButton
            label="PLANIT 시작하기"
            defaultState={{ bgColor: "rgba(29, 29, 29, 0.6)", borderColor: "#414141", textColor: "#FFFFFF" }}
            hoverState={{ bgColor: "rgba(45, 45, 45, 0.4)", borderColor: "#515151", textColor: "#FFFFFF" }} // textColor를 흰색으로 변경
            radius={15}
            paddingX={32}
            paddingY={15}
            font={{ fontSize: "22px", fontWeight: 600, letterSpacing: "0.4px", textAlign: "center", fontFamily: 'SeoulNamsan,Pretendard, sans-serif' }}
            align="center"
            showBorder={false}
            direction="alternate"
            duration={420}
            easing="cubic-bezier(.25,.75,.25,1)"
            stagger={22}
            link="/main"
          />
        </div>
      </div>
    </div>
  )
}