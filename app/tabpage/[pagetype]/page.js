import { ServerSideRequests_anime } from "@/app/api/db_ap/route";
import HeaderClient from "@/components/search/header_client";
import { redirect } from "next/navigation";
import style from './tabpage.module.css';

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

    params.pagetype = params.pagetype.toLowerCase();
    console.log("the pagetype is: ", params.pagetype);
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
                    <div className={style.tabpage}>
                        {
                            response.values.map((value)=>{
                                let fullname = value.anime_name + (value.anime_season?' '+value.anime_season: "");
                                return (
                                    <a className={style.tabpage_item} href={`/animeInfo?id=${value.id}`} key={fullname}>
                                        <img src={`/Posters/${fullname} Poster.jpg`} alt={fullname}/>
                                        <span>{fullname}</span>
                                    </a>
                                );
                            })
                        }
                    </div>
                </>
            )
        }
    }
    redirect("/");
}