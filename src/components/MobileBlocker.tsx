import React from 'react';

const MobileBlocker: React.FC = () => {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      color: '#374151',
      fontFamily: 'Pretendard, sans-serif',
      fontSize: '1.5rem',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <img src="/favicon.png" alt="logo" style={{ width: 80, marginBottom: 24 }} />
      <div style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 12 }}>
        모바일 접속 불가
      </div>
      <div style={{ fontSize: '1.1rem', marginBottom: 8 }}>
        해당 서비스는 PC 환경에서만 이용하실 수 있습니다.
      </div>
      <div style={{ color: '#6366f1', fontWeight: 500 }}>
        PC로 접속해 주세요.
      </div>
    </div>
  );
};

export default MobileBlocker;

