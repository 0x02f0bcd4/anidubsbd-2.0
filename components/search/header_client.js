"use client";
//this is the Client component version of the Header
import Image from "next/image";
import Search from "./search";
import Logo from "../../public/Logo.png";
import hamburger from "../../public/bars.svg";
import { useState } from "react";
import styles from "./header_client.module.css";
import Login from "../Login";

export default function HeaderClient(){
    const [showHamburger,setShowHamburger] = useState(false);
    return (
        <header className={styles.header}>
        	<a href="/" className={styles.logo}><Image className={styles.logoImage} src={Logo} alt="logo"/></a>
        	<div className={styles.searchbar}>
				<Search/>
        	</div>
        	<div className={styles.authentication}>
				<Login/>
        	</div>
        	<Image src={hamburger} className={styles.hamburger} alt="hamburger" onClick={()=>setShowHamburger(!showHamburger)}/>
    	</header>
    );
}