import { redirect } from "next/navigation";
import styles from "./animeInfo.module.css";
import HeaderClient from "@/components/search/header_client";
import { getServerSession } from "next-auth";
import { options } from "../api/auth/[...nextauth]/option";
import { ServerSideRequests_anime } from "../api/db_ap/route";

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
    //get the session id, if avaiable
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
                <div className={styles.infoBox}>
                    <div className={styles.poster_and_play}>
                        <img src = {`/Posters/${fullname} Poster.jpg`} alt="Poster"/>
                        <a href={`/watchPage?animeID=${json.values.id}`}className={styles.watchButton}><button value={`Watch ${json.values.anime_type}`} >Watch</button></a>
                    </div>
                    <div className={styles.descriptions}>
						<div className={styles.general_description}>
                        	<h2 style={{margin: "0px", textAlign: "center"}}>{fullname}</h2>
                        	<h3 style={{textAlign: "center", margin: "0px"}}>
                            	{
                                	json.values.anime_genres.map((value,index)=>{
                                    	return (
                                        	<a href={`/genre/${value.toLowerCase()}`} className={styles.genres} style={index===0?{padding: "0px"}:{paddingLeft: "1rem"}} key={index}> 
                                            	{value} 
                                        	</a>
                                    	)
                                	})
                            	}
                        	</h3>
                            <div className={styles.studios}>
                                <div><h3 style={{paddingLeft: '1rem'}}>Studio</h3><h3 style={{textAlign: "center"}}>{json.values.anime_studio}</h3></div>
                                <div><h3 style={{paddingLeft: '1rem'}}>Localizing studio</h3><h3 style={{textAlign: "center"}}>{json.values.anime_localizing_studio}</h3></div>
                            </div>
				        </div>

                        <p className={styles.description_text}>{json.values.anime_description}</p>
                    </div>
                </div>
 
        		<div className={styles.see_more_tab}>
                    <div className={styles.title}>
                        <h3>Even more</h3>
                    </div>
                    <div className={styles.cards}>
                        <div className={styles.items}>
                           {
                                json.see_more.map((value,index)=>{
                                    let fullname = value.anime_name + (value.anime_season?" "+value.anime_season:"");
                                    if(value.id !== json.values.anime_id){
                                        return (
                                            <a href={`/animeInfo?id=${value.id}`} key={index} className={styles.item_div}>
                                                <img src={`/Posters/${fullname} Poster.jpg`} alt={`Poster of ${fullname}`}/>
                                                <span>{fullname}</span>
                                            </a>
                                        );
                                    }
                                })
                           } 
                        </div>
                    </div>
		        </div>
            </>
        )
    } 
    
    redirect('http://127.0.0.1:3000/');
    return (
        <>
            <p>বাচ্চারা, এখানে খেলা যাবে না, এটা বড়দের জায়গা, বাসায় পাঠানো হচ্ছে ।(<a href="/">যদি হাটতে না পারো, তাহলে এখানে ক্লিক কর</a>)</p>
        </>
    );
}


export default AnimeInfo;
