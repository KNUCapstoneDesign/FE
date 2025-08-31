// src/components/SeeMoreButton.tsx

import React from 'react';
import { motion } from 'framer-motion';
import { IoIosArrowDown } from 'react-icons/io'; // 아랫 방향 화살표 아이콘

interface SeeMoreButtonProps {
  onClick: () => void;
}

const SeeMoreButton: React.FC<SeeMoreButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 1rem', // 내부 패딩
        borderRadius: '25px', // 동그란 모양
        border: '1px solid black', // 테두리
        color: '#1c1c1c',
        cursor: 'pointer',
        overflow: 'hidden', // 내용이 넘칠 경우 숨김
        position: 'relative', // 텍스트 위치 조정을 위해
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // 기본 그림자
        margin: '50px auto 0', // TestPage에서 상단 마진 추가 (기존 버튼과 동일하게)
      }}
      initial={{ width: '50px', height: '50px' }} // 초기 동그란 크기
      animate={{
        width: isHovered ? '120px' : '50px', // 호버 시 너비 확장
        backgroundColor: isHovered ? '#ffffff' : '#ffffff', // 호버 시 배경색 변경
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div
        style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '50px', // 아이콘 컨테이너 너비 고정
        }}
        initial={{ x: 0 }}
        animate={{ x: isHovered ? '-25px' : '0px' }} // 호버 시 아이콘 왼쪽으로 이동
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <IoIosArrowDown size={24} /> {/* 아랫 방향 화살표 아이콘 */}
      </motion.div>

      <motion.span
        style={{
          position: 'absolute',
          opacity: 0,
          whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
          fontSize: '1rem',
          fontWeight: 'bold',
        }}
        initial={{ x: '25px', opacity: 0 }} // 초기 위치 및 투명도
        animate={{
          x: isHovered ? '20px' : '25px', // 호버 시 텍스트 나타나는 위치
          opacity: isHovered ? 1 : 0, // 호버 시 텍스트 나타남
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        더보기
      </motion.span>
    </motion.button>
  );
};

export default SeeMoreButton;