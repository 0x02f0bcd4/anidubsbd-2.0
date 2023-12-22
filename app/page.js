"use client";

import styles from "./page.module.css";
import Image from "next/image";
import Background from "../public/Background.png";
import { useEffect, useState } from "react";
import HeaderClient from "@/components/search/header_client";

function LoadTabs({type}){
	let tabname = '';
	switch(type){
		case 'trending':
			tabname = 'Trending';
			break;
		case 'newest':
			tabname = "Newest";
			break;
		case 'bsub':
			tabname = 'Bangla Subbed';
			break;
		case 'bdub':
			tabname = 'Bangla dubbed'
			break;
		case 'edub':
			tabname = 'English dubbed';
			break;
		default:
			tabname = 'unknown'
	}
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
				<h2>{tabname}</h2>
				<a href={`/tabpage/${type}`}>More {type.toUpperCase()}</a>
			</div>
			<div className={styles.cards}>
				<div className={styles.items}>
			{
				tabContents.values.map((value,index)=>{
					let fullname = "";
					fullname = value.anime_name + (value.anime_season?" "+value.anime_season: "");
					return (
						<a className={styles.item_div} key={index} href={`/animeInfo?id=${value.id}`}>
							<img src={`/Posters/${fullname} Poster.jpg`} className={styles.itemImage} alt={`Poster of ${fullname}`}/>
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
function Page() { return (
    <>
		<HeaderClient/>	
		<div className={styles.banner}>
			<h3>স্বাগতম<br/>বাংলাদেশের অন্যতম জনপ্রিয় অ্যাানিমে ফ্যানডাবিং প্ল্যাটফর্ম<br/> AniDubs এ</h3>	
			<Image src={Background} alt="Front Banner"/>
		</div>


		<LoadTabs type={"trending"}/>
		<LoadTabs type={'newest'}/>
		<LoadTabs type={'bdub'}/>
		<LoadTabs type={"bsub"}/>
		<LoadTabs type={'edub'}/>
    </>
  );
}

export default Page;
