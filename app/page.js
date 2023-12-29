"use client";
import { useEffect, useRef, useState } from "react";
import HeaderClient from "@/components/search/header_client";


function calcBarWidth(scrollLeft,scrollWidth,clientWidth){
	return ((scrollLeft / (scrollWidth-clientWidth))*100);

}


function LoadTabs({type, catchPhrase, reverse}){	
	const scrollShowRef = useRef(); 
	const scrollWidthRef = useRef();
	const scrollbarRef = useRef();
	const [tabContents,setTabContents] = useState({empty: true});
	useEffect(()=>{
		const fetchCall = async () =>{		

			const response = await fetch(`/api/db_ap?param=${type}&short=10`);
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

	const headerClassName = "mx-auto w-[98%] h-auto flex justify-between items-end " + (reverse?"flex-row-reverse":"flex-row");	
	const handleNext = ()=>{
		scrollbarRef.current.scrollLeft += 150;
	};

	const handlePrevious = ()=>{
		scrollbarRef.current.scrollLeft -= 150;	
	};

	const handleEnd = ()=>{
		scrollbarRef.current.scrollLeft = scrollbarRef.current.scrollWidth;
	};

	const handleStart = ()=>{
		scrollbarRef.current.scrollLeft = 0;
	};	

	const handleScroll = ()=>{
		if(window.innerWidth>=640 && window.innerWidth<1024 && scrollbarRef.current.scrollWidth!==scrollbarRef.current.clientWidth){
			//const width = (scrollbarRef.current.scrollLeft / (scrollbarRef.current.scrollWidth-scrollbarRef.current.clientWidth))*100;
			const width = calcBarWidth(scrollbarRef.current.scrollLeft, scrollbarRef.current.scrollWidth,scrollbarRef.current.clientWidth);
			scrollWidthRef.current.style.width = `${width}%`;
		}
	};	


	const handleResize = ()=>{
		//window resize happened, check it the innerWidth is within 640 to 1024 px
		if(window.innerWidth>=640 && window.innerWidth<1024){
			//check if the scrollbarRef's scrollWidth went greater than clientWidth
			if(scrollbarRef.current.scrollWidth !== scrollbarRef.current.clientWidth){
				//then, assign the style to be block
				scrollShowRef.current.style.display = 'block';
			}
			else{
				scrollShowRef.current.style.display = 'none';
			}

			//recalculate the width of the scrollWidthRef
			scrollWidthRef.current.style.width = `${calcBarWidth(scrollbarRef.current.scrollLeft,scrollbarRef.current.scrollWidth,scrollbarRef.current.clientWidth)}`;
		}
		else{
			scrollShowRef.current.style.display = 'none';
		}
	}

	window.addEventListener('resize', handleResize);

	return (
		<section className="my-4">
			<div className={headerClassName}>
				<h2 className="w-[70%] mx-2 text-xl lg:text-2xl" style={reverse?{textAlign: "right"}:{textAlign: "left"}}>{catchPhrase}</h2>
			</div>	

			<div className="mx-auto w-[98%] border border-white border-solid"></div>	
				<div ref={scrollShowRef} style={scrollbarRef.current && scrollbarRef.current.scrollWidth===scrollbarRef.current.clientWidth?{display: "none"}:{}} className="hidden sm:block lg:hidden mt-2 mx-auto  bg-slate-900 w-[90%]">	


					<div ref={scrollWidthRef} style={scrollbarRef && scrollbarRef.current && scrollbarRef.current.scrollWidth!==scrollbarRef.current.clientWidth ? {width: `${calcBarWidth(scrollbarRef.current.scrollLeft,scrollbarRef.current.scrollWidth,scrollbarRef.current.clientWidth)}`}:{}} className="h-[3px] bg-slate-400 border border-solid border-slate-400">
					</div>
				</div>	
			<div className="mt-2 w-full flex flex-row justify-around">

			<div ref={scrollbarRef} onScroll={handleScroll} className="scroll-smooth sm:no_scrollbar mx-auto w-[90%] sm:mx-0 sm:overflow-x-auto sm:h-auto sm:whitespace-nowrap">
				{
					tabContents.values.map((value,index)=>{
						let fullname = value.anime_name + (value.anime_season?" "+value.anime_season:"");
						return (
							<a key={value.id} className="overflow-hidden rounded border sm:border-0 border-cyan-400 border-solid m-2 sm:m-0 p-2 flex sm:inline-flex flex-row sm:flex-col sm:justify-between items-center sm:w-[150px] h-[15dvh] sm:h-[225px]" href={`/animeInfo?id=${value.id}`}>
								<img className="rounded h-full sm:max-w-full sm:h-auto sm:max-h-[80%]" src={`/Posters/${fullname} Poster.jpg`} alt={`Poster of ${fullname}`}/>
								<p className="pl-2 sm:p-0 sm:w-[80%] sm:text-xl overflow-hidden whitespace-nowrap text-ellipsis">{fullname}</p>
							</a>
						)
					})
				}

				<a href={`/tabpage/${type}`} className="whitespace-wrap overflow-hidden rounded border border-cyan-400 border-solid flex sm:inline-flex flex-row justify-center items-center m-2 h-[15dvh] sm:align-top sm:w-[150px] sm:h-full sm:m-0">
					<p className="w-full text-center whitespace-normal">Continue Watching</p>
				</a>
			</div>
			<div className="hidden lg:inline-flex flex-col justify-around w-[8%]" style={scrollbarRef.current && scrollbarRef.current.scrollWidth===scrollbarRef.current.clientWidth?{display: "none"}:{}}>
				<button className="rounded h-1/5 lg:text-lg bg-slate-900 text-cyan-400" onClick={handleNext}>Next</button>
				<button className="rounded h-1/5 lg:text-lg bg-slate-900 text-cyan-400" onClick={handlePrevious}>Previous</button>
				<button className="rounded h-1/5 text-lg bg-slate-900 text-cyan-400" onClick={handleEnd}>End</button>
				<button className="rounded h-1/5 text-lg bg-slate-900 text-cyan-400" onClick={handleStart}>Start</button>
			</div>
			</div>
		</section>
	);	
}
function Page() { return (
    <>
		<HeaderClient/>	
		<div className="rounded-lg shadow-customBSBanner border border-slate-400 border-solid flex flex-col justify-center items-center mt-8 w-[95dvw] h-[50dvh] mx-auto text-center">
			<h3 className="text-4xl text-slate-400 drop-shadow-customBanner">অ্যানিমে দেখুন</h3>
			<h3 className="text-5xl text-cyan-400 drop-shadow-customBannerSlate">বাংলায়</h3>
			<h3 className="text-4xl text-slate-400 drop-shadow-customBanner">AniDubsBD তে</h3>
		</div>


		<LoadTabs type={"trending"} catchPhrase={"তো, সবাই কি দেখছে?"} reverse={false}/>
		<LoadTabs type={'newest'} catchPhrase={"নতুন কি কি আছে?"} reverse={true}/>
		<LoadTabs type={'bdub'} catchPhrase={"কিন্তু আমার যে সাব দেখার জন্য সারিঙ্গান নেই?"} reverse={false}/>
		<LoadTabs type={"bsub"} catchPhrase={"ভাষা জাপানিজ, কিন্তু লেখা বাংলায়?"} reverse={true}/>
		<LoadTabs type={'edub'} catchPhrase={"Y'all got any more of English dub?"} reverse={false}/>


    </>
  );
}

export default Page;
