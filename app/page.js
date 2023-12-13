"use client";

import styles from "./page.module.css";
import Image from "next/image";
import Logo from "../public/Logo.png";
import Background from "../public/Background.png";
import Search from "@/components/search/search";
import hamburger from "../public/bars.svg";
import { useEffect, useState } from "react";
import Login from "@/components/Login";

function LoadTabs({type}){
	const [tabContents,setTabContents] = useState({empty: true});
	useEffect(()=>{
		const fetchCall = async () =>{
			const response = await fetch(`/api/db_ap?param=${type}&short=6`);
			const json = await response.json();
			setTabContents({empty: false, values: json.values});
		}

		fetchCall();
	},[]);

	if(tabContents===null){
		return <h3>ট্যাবের কন্টেন্ট খুঁজে পাওয়া যায়নি</h3>;
	}
	else if(tabContents.empty){
		return <h3>Loading...</h3>
	}
	return (
		<>
		<div className={styles.tabStyle}>
			<div className={styles.tabHeader}>
				<h2>{type}</h2>
				<a href={`/tabpage/${type}`}>See more</a>
			</div>
			<div className={styles.cards}>
				<div className={styles.items}>
			{
				tabContents.values.map((value,index)=>{
					let fullname = "";
					fullname = value.anime_name + (value.anime_season?" "+value.anime_season: "");
					return (
						<a className={styles.item_div} key={index} href={`/animeInfo?id=${value.id}`}>
							<img src={`/Posters/${fullname} Poster.jpg`} className={styles.itemImage}/>
							<p className={styles.itemName}>{fullname}</p>
						</a>
					);
				})
			}
				</div>
			</div>
		</div>
		</>
	);
}

function Page() {
  const [showHamburger,setShowHamburger] = useState(false);
  console.log("hamburger is being show: ",showHamburger);
  return (
    <>
    	<header className={styles.headerHome}>
        	<Image className={styles.logo} src={Logo} alt="logo"/>
        	<div className={styles.searchbarHome}>
				<Search/>
        	</div>
        	<div className={styles.authentication}>
				<Login/>
        	</div>
        	<Image src={hamburger} className={styles.hamburger} alt="hamburger" onClick={()=>setShowHamburger(!showHamburger)}/>
    	</header>
   	 
   	 
    	<div className={styles.hamburger_options} style={showHamburger?{transform: "translateX(-50%)"}:{}}>
			<div className={styles.searchbarHamburger}>
        		<Search onLowerDevice={showHamburger}/>
			</div>
        	<p>Home</p>
        	<p>About us</p>
        	<div className={styles.authentication_phone}>
        	</div>
    	</div>

		<div className={styles.banner}>
			<h3>স্বাগতম<br/>বাংলাদেশের অন্যতম জনপ্রিয় অ্যাানিমে ফ্যানডাবিং প্ল্যাটফর্ম<br/> AniDubs এ</h3>	
			<Image src={Background} alt="Front Banner"/>
		</div>


		<LoadTabs type={"trending"}/>
		<LoadTabs type={"bsub"}/>
    </>
  );
}

export default Page;
