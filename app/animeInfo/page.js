import { redirect } from "next/navigation";
import styles from "./animeInfo.module.css";
import HeaderClient from "@/components/search/header_client";

async function AnimeInfo({searchParams}){
    if(searchParams.id){
        const response = await fetch(`http://127.0.0.1:3000/api/db_ap?param=info&id=${searchParams.id}`,{
            next:{
                revalidate: 10
            }
        });
        const json = await response.json();
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
                        <a href="" className={styles.watchButton}><button value={`Watch ${json.values.anime_type}`} >Watch {json.values.anime_type}</button></a>
                    </div>
                    <div className={styles.descriptions}>
						<div className={styles.general_description}>
                        	<h2 style={{margin: "0px", textAlign: "center"}}>{fullname}</h2>
                        	<h3 style={{textAlign: "center", margin: "0px"}}>
                            	{
                                	json.values.anime_genres.map((value,index)=>{
                                    	return (
                                        	<a href={`/genre/${value.toLowerCase()}`} style={index===0?{padding: "0px"}:{paddingLeft: "1rem"}} key={index}> 
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
