import { ServerSideRequests_anime } from "@/app/api/db_ap/route";
import HeaderClient from "@/components/search/header_client";
import { redirect } from "next/navigation";

export async function generateMetadata({params}){
    let pagename = undefined;
    switch(params.pagetype){
        case 'trending':
        {
            pagename = 'Trending';
            break;
        }
        case 'newest':{
            pagename = 'Newest';
            break;
        }
        case 'bdub':{
            pagename = 'Bangla dubbed';
            break;
        }
        case 'bsub':{
            pagename = 'Bangla subbed';
            break;
        }
        case 'edub':{
            pagename = 'English dubbed';
            break;
        }
    } 

    if(pagename){
        //if a valid pagename is set
        return {
            title: `${pagename} anime`,
            description: `Watch all the ${pagename} anime on AniDubsBD`,
            openGraph:{
                title: `${pagename} anime`,
                description: `Watch all the ${pagename} anime on AniDubsBD`
            }
        }
    }

    return {
        title: 'Error',
        description: `No such page found`,
        openGraph:{
            title: `Error`,
            description: `No such page found`
        }
    }
}


export default async function Page({params}){

    let tabname = undefined;
    params.pagetype = params.pagetype.toLowerCase();

    switch(params.pagetype){
        case 'trending':
            tabname = 'Trending';
            break;
        case 'newest':
            tabname = 'Newest';
            break;
        case 'bdub':
            tabname = 'Bangla dubbed';
            break;
        case 'bsub':
            tabname = 'Bangla subbed';
            break;
        case 'edub':
            tabname = 'English dubbed';
            break;
    }


    switch(params.pagetype){
        case 'trending':
        case 'newest':
        case 'bsub':
        case 'bdub':
        case 'edub':
        {
            let response = await ServerSideRequests_anime('getTabInfo',{pagetype: params.pagetype});
            return (
                <>
                    <HeaderClient/>
                    <div className="flex flex-col items-center mx-auto mt-6 text-center w-[90vw]">
                        <h2 className="w-fit mb-3 border-b-2 border-slate-400 border-solid text-xl">{tabname}</h2>
                    <div className="w-full grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 grid-flow-row">
                        {
                            response.values.map((value)=>{
                                let fullname = value.anime_name + (value.anime_season?' '+value.anime_season: "");
                                return (
                                    <a className="p-2 rounded bg-opacity-40 bg-gray-600 w-full h-full flex flex-col items-center justify-around" href={`/animeInfo?id=${value.id}`} key={fullname}>
                                        <img src={`/Posters/${fullname} Poster.jpg`} alt={fullname} className="max-w-full max-h-[80%]"/>
                                        <span className="w-[95%] text-[#cafefe] text-center m-0 p-0 text-ellipsis overflow-hidden whitespace-nowrap">{fullname}</span>
                                    </a>
                                );
                            })
                        }
                    </div>
                    </div>

                </>
            )
        }
    }
    redirect("/");
}