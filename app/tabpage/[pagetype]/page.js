import { ServerSideRequests_anime } from "@/app/api/db_ap/route";
import HeaderClient from "@/components/search/header_client";
import { redirect } from "next/navigation";
import style from './tabpage.module.css';

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