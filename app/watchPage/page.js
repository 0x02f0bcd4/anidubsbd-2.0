'use client';

import HeaderClient from "@/components/search/header_client";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect,  useRef,  useState } from "react";
import styles from './watchPage.module.css';


function fetchComments(animeID,episodeID, setter){
    fetch(`/api/db_ap?param=comments&animeID=${animeID}&episodeID=${episodeID}`).then((response)=>{
            if(response.status===200){
                return response.json();
            }else{
                setter(null);
            } 
        }).then((json)=>{
            if(json){
                setter({empty: false, comments: json.values});
            }
        });
}


function PostComment(userID, animeID, episodeID, comment, newCommentSection){
    let form = new FormData();
        form.append('userID',userID);
        form.append('animeID',animeID);
        form.append('episodeID',episodeID);
        form.append('comment',comment);

    fetch('/api/user_DBAP',{
            method: 'POST',
            body: form
        }).then((response)=>{
            //the fetch request was succesful, fetch the comments again
            fetchComments(animeID,episodeID,newCommentSection);
        });
}

function LoadComment({animeID,episodeID})
{
    const userSession = useSession();
    const [postCommentJSX, setPostCommentJSX] = useState((<h2>Loading, please wait...</h2>));
    const commentRef = useRef();
    const [comments,setComments] = useState({
        empty:true
    });

    useEffect(()=>{
        fetchComments(animeID,episodeID,setComments); 
    },[episodeID]);

    const handleCommentSubmit = (event)=>{
        event.preventDefault();
        PostComment(userSession.data.user.userID,animeID,commentRef.current.getAttribute('episode-number'),commentRef.current.value,setComments);
        commentRef.current.value = '';
    };

    useEffect(()=>{
        if(userSession.status === 'unauthenticated'){
            //the user isn't logged in
            setPostCommentJSX((<h2><a href='/api/auth/signin' style={{textDecoration:"none", color: 'orange'}}>Login</a> to post comment</h2>));
        }
        else if(userSession.status === 'authenticated'){ 
            setPostCommentJSX((
                    <form className={styles.commentbox} onSubmit={handleCommentSubmit}>
                        <textarea minLength={2} maxLength={2000} autoComplete="off" episode-number={episodeID} placeholder="Insert your comment" ref={commentRef}/>
                        <button onClick={handleCommentSubmit}>POST!</button>
                    </form>
            ));
        }
    },[episodeID,userSession]);

    if(!comments){
        return (
            <>
                <h2>The comments couldn&apos;t be loaded, 
                    either because the comment section doesn&apos;t exist for this anime, or the anime doesn&apos;t exist
                </h2>
            </>
        );
    }
    else if(comments.empty){
        return(
            <>
                <h2>Loading comments, hang tight...</h2>
            </>
        )
    }


    return (
        <>
            <div className={styles.comment_section}>
                <h2>মন্তব্য</h2>
                <div className={styles.postedcomment}>
                {
                    comments.comments.map((value,index)=>{
                        return (
                            <div key={index} className={styles.comment}>
                                <h3>{value.username}</h3>
                                <h4>{value.comment}</h4>
                            </div>
                        );
                    })
                } 
                </div>
                <div className={styles.postcomment}>
                    {postCommentJSX}
                </div>
            </div>
        </>
    ); 
}

export default function Page(){
    //first, check for a legal animeID
    
    const searchParams = useSearchParams();
    const animeID = parseInt(searchParams.get('animeID'));
    const [episodeList,setEpisodeList] = useState({empty: true});
    const [currentEpisode, setCurrentEpisode] = useState(0);
    if(!animeID)
    {
        return (
            <>
                <h2>You landed on a page that is considered illegal<a href="/">Go back</a></h2>
            </>
        );
    }
    
    useEffect(()=>{
        fetch(`/api/user_DBAP?param=we&animeID=${animeID}`).then((response)=>{
            if(response.status===200){
                //the anime was found, set anime episode episodeList
                return response.json();
            }
            else
            {
                //set episodelist to null
                setEpisodeList(null);
                return null;
            }
        }).then((json)=>{
            if(json){
                setEpisodeList({empty: false, values: json.values});
            }
        });
    },[]);
    
    const LoadingJSX = (
        <>
            <h2>Loading, please wait...</h2>
        </>
    );

    //the fetch response wasn't 200, probably no result was found/internal server error
    if(!episodeList)
    {
        return (
            <>
                <h2>You landed on a page that is considered illegal, <a href="/">Go back</a></h2>
            </>
        );
    }
    else if(episodeList.empty){
        //fetching data, show Loading...
        return (
            <>
                <h2>Loading, please wait...</h2>
            </>
        );
    }
    
    //if it was none of the cases, then it means that fetching is done and the data is already here
    const handleEpisodeChange = (event)=>{
        const newEpisode = event.target.getAttribute('episode-number');
        setCurrentEpisode(parseInt(newEpisode));
    };

    const handlePreventingRedirecing = (event)=>{
        event.preventDefault();
    };

    let animeName = episodeList.values.anime_name + (episodeList.values.anime_season?' '+episodeList.values.anime_season: '');
    return (
        <>
            <HeaderClient/>
            
            <p className={styles.anime_title}><span className={styles.watching}>আপনি দেখছেন </span><span className={styles.anime_ep_name}>{animeName}</span></p>
            <p className={styles.episode_title}><span className={styles.watching}>পর্ব </span><span className={styles.anime_ep_name}>{episodeList.values.episode_list[currentEpisode].episode_name}</span></p>
            <div className={styles.ViewPort}>
                <iframe src={episodeList.values.episode_list[currentEpisode].episode_url} allowFullScreen="allowfullscreen">

                </iframe>
                <ol className={styles.viewpage_episode_list}>
                    {
                        episodeList.values.episode_list.map((value,index)=>{ 

                            return (
                                <li className={styles.viewpage_episode_list_item} key={index} onClick={handleEpisodeChange} episode-number={index}>
                                    <a href={value.episode_url} onClick={handlePreventingRedirecing}><p>{index+1} . {value.episode_name}</p></a>
                                </li>
                            )
                        })
                    }
                </ol>
            </div>

            <LoadComment animeID={animeID} episodeID={currentEpisode+1}/>
            <div className={styles.see_more_tab}>
                    <div className={styles.title}>
                        <h3>Even more</h3>
                    </div>
                    <div className={styles.cards}>
                        <div className={styles.items}>
                           {
                                episodeList.values.see_more.map((value,index)=>{
                                    let fullname = value.anime_name + (value.anime_season?" "+value.anime_season:"");
                                    if(value.id !== episodeList.values.id){

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
    );
    /*return(
        <>
            <div>
                <iframe src={episodeList.values.episode_list[currentEpisode].episode_url}/>
                <ul>
                    {
                        episodeList.values.episode_list.map((value,index)=>{
                            return(
                                <li key={index} episode-number={index} onClick={handleEpisodeChange}>{value.episode_name}</li>
                            );
                        })
                    }
                </ul>
            </div>
            <LoadComment animeID={animeID} episodeID={currentEpisode+1}/>
        </>
    );*/
}