"use client";
//this is the Client component version of the Header
import Image from "next/image";
import Search from "./search";
import Logo from "../../public/Logo.png";
import hamburger from "../../public/bars.svg";
import search from "../../public/magnifying-glass-solid.svg";
import { useState } from "react";
import LoginStylePC from './LoginPC.module.css';
import LoginStyleMobile from './LoginMobile.module.css';
import Login, { LoginHamburger } from "../Login";



export default function HeaderClient(){
	const [showHamburger, setShowHamburger]	= useState(false);
	const [showSearch,setShowSearch] = useState(false);
	const handleShowSearch = ()=>{
		//if the showSearch is false, meaning it's now about to turn on, then turn off showHamburger
		if(!showSearch){
			setShowHamburger(false);
		}
		setShowSearch(!showSearch);
	}

	const handleHamburger = () =>{
		//if the showHamburger is false, meaning it's now about to turn on, then turn off showSearch
		if(!showHamburger){
			setShowSearch(false);
		}
		setShowHamburger(!showHamburger);	
	};


	return (
		<>

			<header className="static md:sticky z-40 flex flex-row items-center justify-between rounded top-2 mx-auto w-[98vw] h-[8dvh] short:h-[15dvh] bg-regal-blue">
				<a href='/' className="flex flex-row justify-start w-[25%] md:w-[12%] h-full">
					<Image src={Logo} alt='Logo' className="max-h-full object-contain aspect-[2/1]"/>
				</a>

				<div className="hidden md:block w-[60%] h-[90%]">
					<Search/>
   		     	</div>

				<Login className={"hidden md:flex flex-row w-[10%] h-full border-l rounded-tl rounded-bl border-solid border-l-fuchsia-400  text-slate-900"}/>

				<Image onClick={handleShowSearch} src={search} alt='searchIcon' className="md:hidden"/>
				<Image onClick={handleHamburger} src={hamburger} alt="Hamburger menu" className="md:hidden max-h-full max-w-[10%] cursor-pointer pr-1"/>
			</header>

			<div style={showSearch?{display:'block'}:{display: 'none'}} className="md:hidden z-40 mx-auto top-[10dvh] w-[90dvw] h-[8dvh]">
				<Search/>
			</div>

			<div style={showHamburger?{width:'300px'}:{width: '0%'}} className="absolute top-[10dvh] transition-[width] duration-700 rounded overflow-hidden bg-slate-900 flex flex-col items-center right-1 opacity-1 z-[75]">
				<a href="/tabpage/trending" className="whitespace-nowrap overflow-hidden p-2 text-lg">Watch Trending Anime</a>
				<a href="/tabpage/bdub" className="whitespace-nowrap overflow-hidden p-2 text-lg">Watch Bangla Dubbed Anime</a>
				<a href="/tabpage/bsub" className="whitespace-nowrap overflow-hidden p-2 text-lg">Watch Bangla Subbed Anime</a>
				<a href="/tabpage/edub" className="whitespace-nowrap overflow-hidden p-2 text-lg">Watch English Dubbed Anime</a>

				<LoginHamburger/>
			</div>
		</>
	)
}


/*
			<div style={showHamburger?{height: 'auto'}:{height:'0'}} className="transform-gpu rounded transition-height duration-700 border boder-cyan-900 flex flex-col items-center bg-slate-400 md:hidden z-40 absolute mx-auto top-[10dvh] w-[90dvw]">
				<a href="/tabpage/trending" className="p-2 text-xl">Watch Trending anime</a>
				<a href="/tabpage/bdub" className="p-2 text-xl">Watch Bangla dubbed</a>
				<a href="/tabpage/bsub" className="p-2 text-xl">Watch Bangla subbed</a>
				<a href="/tabpage/edub" className=" p-2 text-xl">Watch English dubbed</a>
				<LoginHamburger/>
			</div> 
*/