"use client";
//this is the Client component version of the Header
import Image from "next/image";
import Search from "./search";
import Logo from "../../public/Logo.png";
import hamburger from "../../public/bars.svg";
import { useState } from "react";
import styles from "./header_client.module.css";
import LoginStylePC from './LoginPC.module.css';
import LoginStyleMobile from './LoginMobile.module.css';
import Login from "../Login";

export default function HeaderClient(){
    const [showHamburger,setShowHamburger] = useState(false);
	return( 
		<>
		<header className={styles.headerHome}>
			<a href='/' className={styles.logo}>
      		  	<Image src={Logo} alt="logo" style={{objectFit: "contain", aspectRatio: '2/1', maxWidth: '100%', height: '100%'}}/>
			</a>
        	<div className={styles.searchbarHome}>
				<Search/>
        	</div>
			<Login hide={showHamburger} styleName={'PC style'} styles={LoginStylePC}/>	
        	<Image src={hamburger} className={styles.hamburger} alt="hamburger" onClick={()=>setShowHamburger(!showHamburger)}/>
    	</header>
   	 
   	 
    	<div className={styles.hamburger_options} style={showHamburger?{transform: "translateX(-50%)"}:{}}>
			<div className={styles.searchbarHamburger}>
        		<Search onLowerDevice={showHamburger}/>
			</div>
        	<a href='/tabpage/bdub' className={styles.hamburger_options_item}><p href='/'>Watch Bangla dub</p></a>
        	<a href='/tabpage/bsub' className={styles.hamburger_options_item}><p href='/'>Watch Bangla sub</p></a>
			<a href='/tabpage/edub' className={styles.hamburger_options_item}><p href='/'>Watch English dub</p></a>
			<Login hide={!showHamburger} styleName={'Mobile Style'} styles={LoginStyleMobile}/>
    	</div>
		</>
	);
}