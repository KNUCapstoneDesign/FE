// src/components/Footer.tsx
import styles from '../assets/Footer.module.css';  // CSS 모듈 import

const Footer = () => {
  return (
    <footer className={styles.footerContainer}>
      <p className={styles.footerText}>© 2025 PLANIT. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
