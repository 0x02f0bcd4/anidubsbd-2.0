import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/option";
import { ServerSideRequests_anime } from "../api/db_ap/route";
import HeaderClient from "@/components/search/header_client";
//get the anime name and season(yeah yeah I know, we are fetching twice)
export async function generateMetadata({params,searchParams}){
    const animeID = parseInt(searchParams.id);
    let anime_name = undefined;
    let anime_season = undefined;
    let anime_type = undefined;
    if(animeID){
        let query_result = await ServerSideRequests_anime('getAnimeForMetadata',{id: animeID});
        if(query_result.status === 200){
            //the anime was found successfully
            anime_name = query_result.values[0].anime_name;
            anime_season = query_result.values[0].anime_season;
            anime_type = query_result.values[0].anime_type;
            switch(anime_type){
                case 'BDUB':{
                    anime_type = 'Bangla Dubbed';
                    break;
                }
                case 'BSUB':{
                    anime_type = 'Bangla Subbed';
                    break;
                }
                case 'EDUB':{
                    anime_type = 'English Dubbed';
                    break;
                }
            }
        } 
    }

    if(anime_name){
        //if the anime_name is set, it means that there's an animeID to show
        let fullname = anime_name + (anime_season?' '+anime_season: '');
        return {
            title: `Watch ${fullname} on AniDubsBD`,
            description: `Watch ${fullname} ${anime_type} only on AniDubsBD at highest quality, along with many more.`,
            openGraph:{
                title: `Watch ${fullname} on AniDubsBD`,
                description: `Watch ${fullname} ${anime_type} only on AniDubsBD at highest quality, along with many more.`,
            }
        }
    }
    
    return {
        title: "Error, no anime found",
        description: "No such anime found",
        openGraph: {
            title: "Lost, or missing anime",
            description: "No such anime found",
        }
    }
}

async function AnimeInfo({searchParams}){
    const animeID = parseInt(searchParams.id);
    if(animeID){
        let promises = await Promise.all([ServerSideRequests_anime('info',{id: animeID}),getServerSession(options)]); 

        if(promises[0].status!==200){
            //the status wasn't good, return back to home
            redirect('http://localhost:3000/');
        } 

        const json = promises[0].values;
        if(json.values.anime_type === 'BDUB'){
            json.values.anime_type = 'Bangla Dub';
        }
        else if(json.values.anime_type === 'BSUB'){
            json.values.anime_type = 'Bangla Sub';
        }
        else{
            json.values.anime_type = 'English Dub';
        }
        
        const fullname = json.values.anime_name + (json.values.anime_season? " "+json.values.anime_season: "");        
        
        return (
            <>
                <HeaderClient/>
                <div className="hidden lg:block overflow-hidden relative mt-12 rounded-xl mx-auto bg-no-repeat bg-cover before:content-[' '] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-slate-100 before:opacity-40" style={{backgroundImage: `url('/KeyVisuals/${fullname}.png')`, width: '90vw', height: '80vh'}}>
                    <div className="absolute flex flex-row justify-start items-end top-0 left-0 w-full h-full z-10">
                        <div className="w-fit flex flex-row m-3 justify-between">
                            <div className="flex flex-col justify-center items-center">
                                <img src={`/Posters/${fullname} Poster.jpg`} alt={`Poster of ${fullname}`} className="max-w-36 rounded"/>
                                <a href={`${process.env.baseURL}watchPage?animeID=${json.values.id}`} className="bg-sky-900 mt-2 p-2 rounded">Watch now</a>
                            </div>
                            <div className="rounded backdrop-blur-3xl ml-3 flex flex-col justify-start item-start">
                                <h1 className="text-2xl text-slate-900 p-2">{fullname}</h1>
                                <h4 className="text-xl text-slate-900 px-2 my-2">{json.values.anime_studio}</h4>
                                <h4 className="px-2 text-slate-900 my-1">Localizing studio: {json.values.anime_localizing_studio}</h4>
                                <div className="px-2 my-2">
                                {
                                    json.values.anime_genres.map((value,index)=>{ 
                                        return (
                                            <a href={`/genre/${value}`} key={value} className="hover:bg-slate-900 hover:text-cyan-400 text-slate-900 p-1 border border-cyan-400 rounded mr-1 ">{value}</a>
                                        );
                                    })
                                }
                                </div>

                                <p className="text-slate-900 px-1">{json.values.anime_description}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="lg:hidden rounded-xl overflow-hidden bg-cover bg-no-repeat relative mt-4 mx-auto bg-top before:content-[' '] before:absolute before:top-0 before:left-0 before:bg-white before:w-full before:h-full before:bg-opacity-60" style={{backgroundImage: `url('/KeyVisuals/${fullname}.png')`,width: '90vw'}}>
                    <div className="relative my-2 flex flex-col items-center w-full z-10">
                        <img src={`/Posters/${fullname} Poster.jpg`} alt={`Poster of ${fullname}`} className="max-w-28"/>
                        <a href={`/watchPage?animeID=${json.values.id}`} className="bg-sky-900 mt-2 p-2 rounded">Watch now</a>
                    </div>

                    <div className="relative my-2 rounded mx-auto w-11/12 backdrop-blur-3xl z-10 flex flex-col items-center">
                        <h2 className="text-slate-900 text-2xl">{fullname}</h2>
                        

                        <div className="my-2 w-[98%] flex gap-2 justify-center flex-row flex-wrap">
                            {
                                json.values.anime_genres.map((value)=>{
                                    return (
                                        <a key={value} href={`/genre/${value}`} className="p-1 rounded bg-slate-900 text-cyan-400">{value}</a>
                                    )
                                })
                            }
                        </div>


                        <h2 className="text-xl text-slate-900">{json.values.anime_studio}</h2>
                        <h2 className="text-xl text-slate-900">Fan dubbed - {json.values.anime_localizing_studio}</h2>

                        <p className="p-2 text-slate-900">{json.values.anime_description}</p>
                    </div>
                </div>
                
                <h2 className="mx-2 text-2xl mt-4 border-b-2 border-solid border-slate-100">Even more</h2> 
                <div className="my-2 min-[550px]:flex flex-row gap-1 flex-wrap justify-around items-center">
                    {
                        json.see_more.map((value)=>{
                            if(value.id!==json.values.id){
                                let fullname = value.anime_name + (value.anime_season?" "+value.anime_season:"");
                                return (
                                    <a key={value.id}  className="border border-slate-500 border-solid rounded items-center my-2 h-[20svh] max-h-[100px] min-[550px]:h-[250px] min-[550px]:max-h-[250px] flex flex-row min-[550px]:flex-col w-[95%] min-[550px]:w-[150px] mx-auto min-[550px]:m-0 min-[550px]:p-2" href={`/animeInfo?id=${value.id}`}>
                                        <img src={`/Posters/${fullname} Poster.jpg`} alt={`Poster of ${fullname}`} className="ml-2 min-[550px]:ml-0 max-w-[15%] h-full min-[550px]:max-w-full"/>
                                        <p className="ml-2 w-[75%] min-[550px]:w-[90%] overflow-hidden whitespace-nowrap
                                         text-ellipsis">{fullname}</p>
                                        
                                    </a>
                                );
                            }

                            return (<></>);
                        })
                    }
                </div>


            </>
        );
    }


    redirect(process.env.baseURL);
    return (
        <>
            <p>বাচ্চারা, এখানে খেলা যাবে না, এটা বড়দের জায়গা, বাসায় পাঠানো হচ্ছে ।(<a href="/">যদি হাটতে না পারো, তাহলে এখানে ক্লিক কর</a>)</p>
        </>
    );
}

export default AnimeInfo;
