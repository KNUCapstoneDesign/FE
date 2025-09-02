"use client";
import { FaArrowRight } from "react-icons/fa";
import { useState, useRef, useId, useEffect } from "react";

interface SlideData {
  src: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
  onImageClick: (index: number) => void;
  slideLength: number; // 추가된 props
}

const Slide = ({ slide, index, current, handleSlideClick, onImageClick, slideLength }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);

  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>(undefined);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;
      const x = xRef.current;
      const y = yRef.current;
      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const { src } = slide;

  // 💡 [수정됨] 이미지 클릭 로직 통합
  const handleImageClick = () => {
    if (current === index) {
      // 현재 보고 있는 메인 이미지일 경우, 모달을 엽니다.
      onImageClick(index);
    } else {
      // 옆에 있는 다른 이미지일 경우, 해당 이미지로 이동합니다.
      handleSlideClick(index);
    }
  };

  const getZIndex = (current: number, index: number, length: number) => {
    if (current === index) return 30;
    // 오른쪽(left-to-right) 기준으로 current보다 작은 인덱스(왼쪽)는 더 낮은 zIndex, 큰 인덱스(오른쪽)는 더 높은 zIndex
    // 캐러셀 순환 고려
    const diff = (index - current + length) % length;
    if (diff === 0) return 30;
    if (diff <= Math.floor(length / 2)) {
      // 오른쪽(다음) 사진들: current보다 크면 zIndex 20, 그 외 15, 10 등
      return 20 - diff * 5;
    } else {
      // 왼쪽(이전) 사진들: current보다 작으면 zIndex 10, 그 외 5, 0 등
      return 10 - (length - diff) * 5;
    }
  };

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]"
      style={{
        position: 'relative', // zIndex 적용을 위해 명시적으로 추가
        zIndex: getZIndex(current, index, slideLength),
      }}
    >
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[70vmin] h-[40vmin] mx-[-6vmin]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index
              ? "scale(0.85) rotateX(8deg)"
              : "scale(1.1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        <div
          className="absolute top-0 left-0 w-full h-full bg-[#1D1F2F] rounded-[1%] overflow-hidden transition-all duration-150 ease-out"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
          }}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-600 ease-in-out cursor-pointer"
            style={{
              opacity: current === index ? 1 : 0.5,
            }}
            alt=""
            src={src}
            loading="eager"
            decoding="sync"
            onClick={handleImageClick} // 💡 [수정됨] 통합된 클릭 핸들러 사용
          />
          {current === index && (
            <div className="absolute inset-0 bg-black/20 transition-all duration-1000" />
          )}
        </div>
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({ type, title, handleClick }: CarouselControlProps) => {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 dark:bg-neutral-800 border-3 border-transparent rounded-full focus:border-[#6D64F7] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <FaArrowRight className="text-neutral-600 dark:text-neutral-200" />
    </button>
  );
};

interface CarouselProps {
  slides: SlideData[];
  onImageClick: (index: number) => void;
}

export function Carousel({ slides, onImageClick }: CarouselProps) {
  // 첫 번째 사진(인덱스 0)에서 시작하도록 초기값 변경
  const [current, setCurrent] = useState(0);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const id = useId();

  // 💡 [수정됨] 전체 레이아웃 구조 변경
  return (
    <div
      className="flex flex-col items-center justify-center gap-4" // 부모를 flex-col로 변경
      aria-labelledby={`carousel-heading-${id}`}
    >
      {/* 슬라이드 영역 */}
      <div className="relative w-[54vmin] h-[40vmin]">
        <ul
          className="absolute flex mx-[-2vmin] transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${current * (100 / slides.length)}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <Slide
              key={index}
              slide={slide}
              index={index}
              current={current}
              handleSlideClick={handleSlideClick}
              onImageClick={onImageClick}
              slideLength={slides.length} // 추가된 props 전달
            />
          ))}
        </ul>
      </div>

      {/* 컨트롤 버튼 영역 */}
      <div className="flex justify-center w-full">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />
        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>
    </div>
  );
}