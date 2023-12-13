import styles from "./header.module.css";
import Image from "next/image";
import Logo from "../../public/Logo.png";


export default function Header(){
    return (
        <header className={styles.headerHome}>
        	<a href="/" className={styles.covering_href}><Image src={Logo} alt="logo" className={styles.logo}/></a>
        	<div className={styles.authentication}>
          		<a href="/api/auth/login" className={styles.button}>Login/Register</a>
        	</div>
    	</header>
   );
}