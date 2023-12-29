import { ServerSideRequests_anime } from "@/app/api/db_ap/route";
import HeaderClient from "@/components/search/header_client";

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
            <div className="flex flex-col items-center mx-auto mt-6 text-center w-[90vw]">
                    <h2 className="w-fit mb-3 border-b-2 border-slate-400 border-solid text-xl">{params.genretype.toUpperCase()}</h2>
            <div className="w-full grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 grid-flow-row">
                
                {
                    response.values.map((value) =>{
                        let fullname = value.anime_name + (value.anime_season?' '+value.anime_season:'');
                        return (
                            <a className="rounded flex flex-col justify-around items-center p-2 bg-slate-600 bg-opacity-40" href={`/animeInfo?id=${value.id}`} key={fullname}>
                                <img src={`/Posters/${fullname} Poster.jpg`} alt={fullname} className="max-h-[80%] max-w-full"/>
                                <span className="block w-[95%] text-center m-0 p-0 overflow-hidden whitespace-nowrap text-ellipsis">{fullname}</span>
                            </a>
                        );
                    })
                }
            </div>
            </div>


        </>
    ) 
}