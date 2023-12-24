import { ServerSideRequests_anime } from "@/app/api/db_ap/route";
import HeaderClient from "@/components/search/header_client";
import styles from "../../tabpage/[pagetype]/tabpage.module.css";


export async function generateMetadata({params}){
    return {
        title: `${params.genretype} genre`,
        description: `View all the anime tagged having ${params.genretype} genre`,
        openGraph:{
            title: `${params.genretype} genre`,
            description: `View all the anime tagged having ${params.genretype} genre` 
        }
    }
}
export default async function Page({params}){
    let requestParam = {
        genre_name: params.genretype.toLowerCase()
    }


    let response = await ServerSideRequests_anime('getAnimeByGenre',requestParam)
    if(response.status === 404){
        return (
            <>
                <HeaderClient/>
                <h2>হারিকেন দিয়াও তো খুইজ্জা পাইলাম নারে মনু, <a href='/' style={{textDecoration: 'none', color: 'cyan'}}>বাসায় চলি যাও মনু</a></h2>
            </>
        )
    }



    return (
        <>
            <HeaderClient/>
            <div className={styles.tabpage}>
                {
                    response.values.map((value,index) =>{
                        let fullname = value.anime_name + (value.anime_season?' '+value.anime_season:'');
                        return (
                            <a className={styles.tabpage_item} href={`/animeInfo?id=${value.id}`} key={fullname}>
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