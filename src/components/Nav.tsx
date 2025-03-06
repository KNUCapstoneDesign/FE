// src/components/Nav.tsx
import { Link } from 'react-router-dom';
import styles from '../assets/Nav.module.css';
import logo from '/favicon.jpeg';

const Nav = () => {
  return (
    <nav className={styles.navcontainer}>
      <div className='logocontainer'>
        <Link to="/" className={styles.logoLink}>
       <img src={logo} alt="메인페이지로 이동" className={styles.logo}/>
       <div className={styles.navTitle}>CAPSTONE DESIGN</div>
       </Link>
      </div>

      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/" className={styles.navLink}>메인페이지</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/about" className={styles.navLink}>About</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/services" className={styles.navLink}>Services</Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/contact" className={styles.navLink}>Contact</Link>
        </li>
      </ul>
      <ul className={styles.navRight}>
        <li className={styles.navItem}>
          <Link to="/login" className={styles.navLink}>Login</Link>
        </li>
        <li className={styles.nav}>
          <Link to="/signup" className={styles.navLink}>Sign Up</Link>
        </li>
        </ul>
    </nav>
  );
};

export default Nav;
