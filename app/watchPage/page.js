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
            setPostCommentJSX((<h2 className="text-xl"><a href='/api/auth/signin' className="pl-2 text-cyan-400 text-2xl">Login</a> to post comment</h2>));
        }
        else if(userSession.status === 'authenticated'){ 
            setPostCommentJSX((
                    <form className="rounded flex flex-col justify-around relative mx-auto w-[98%] h-full bg-slate-900" onSubmit={handleCommentSubmit}>
                        <textarea className="p-1 focus:outline-none focus:border border-solid border-cyan-400 resize-none rounded placeholder:text-center bg-slate-900 text-slate-300 w-full h-[70%]" minLength={2} maxLength={2000} autoComplete="off" episode-number={episodeID} placeholder="Insert your comment" ref={commentRef}/>
                        <button className="text-slate-900 px-2 w-fit rounded bg-slate-400"onClick={handleCommentSubmit}>POST!</button>
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
        const newEpisode = event.target.getAttribute('enumber');
        setCurrentEpisode(parseInt(newEpisode));
    };

    const handlePreventingRedirecing = (event)=>{
        event.preventDefault();
    };

    let animeName = episodeList.values.anime_name + (episodeList.values.anime_season?' '+episodeList.values.anime_season: '');
    return (
        <>
            <HeaderClient/>
            
            <p className="text-xl text-center mt-4"><span className="text-white text-2xl">আপনি দেখছেন </span><span className="text-cyan-400">{animeName}</span></p>
            <p className="text-xl text-center mt-2"><span className="text-white text-2xl">পর্ব </span><span className="text-cyan-400">{episodeList.values.episode_list[currentEpisode].episode_name}</span></p>
            <main className="my-4 flex h-auto w-[98vw] lg:h-[80vh] flex-col lg:flex-row justify-around items-center mx-auto">
                <iframe className="border border-slate-400 rounded w-full lg:w-1/2 lg:h-auto aspect-video" src={episodeList.values.episode_list[currentEpisode].episode_url} allowFullScreen="allowfullscreen">

                </iframe>
                <ol className="no_scrollbar w-full max-h-[80vh] mt-2 lg:mt-0 lg:w-1/3 lg:h-auto border border-cyan-400 rounded lg:max-h-[98%] overflow-scroll">
                    {
                        episodeList.values.episode_list.map((value,index)=>{ 

                            return (
                                <li className={"text-cyan-400 p-2 hover:bg-slate-400 hover:text-slate-900"+(index===currentEpisode?" bg-slate-400 text-slate-900": "")} key={index} onClick={handleEpisodeChange} enumber={index}>
                                    <a href={value.episode_url} onClick={handlePreventingRedirecing} enumber={index}><p enumber={index}>{index+1} . {value.episode_name}</p></a>
                                </li>
                            )
                        })
                    }
                </ol>
            </main>

            <LoadComment animeID={animeID} episodeID={currentEpisode+1}/>

            <section className="my-2">
                <h3 className="text-xl md:text-2xl w-[90%] mx-auto border-b border-white border-solid">Even more</h3>
                <div className="mx-auto w-[90%] block mt-2 min-[550px]:flex gap-1 flex-row flex-wrap items-center justify-around">
                    {
                        episodeList.values.see_more.map((value,index)=>{
                            if(value.id!==episodeList.values.id)
                            {
                                let fullname = value.anime_name + (value.anime_season?" "+value.anime_season:"");
                                
                                return (
                                    <a className="border border-slate-500 border-solid rounded items-center my-2 h-[20dvh] max-h-[100px] min-[550px]:h-[250px] min-[550px]:max-h-[250px] flex flex-row min-[550px]:flex-col w-[95%] min-[550px]:w-[150px] mx-auto min-[550px]:m-0 min-[550px]:p-2 " key={value.id} href={`/animeInfo?id=${value.id}`}>
                                        <img className="ml-2 min-[550px]:ml-0 max-w-[15%] h-full min-[550px]:max-w-full " src={`/Posters/${fullname} Poster.jpg`} alt={`Poster of ${fullname}`}/>
                                        <p className="ml-2 w-[75%] min-[550px]:w-[90%] overflow-hidden whitespace-nowrap
                                         text-ellipsis">{fullname}</p>
                                    </a>
                                )
                            }
                            return (
                                <>
                                </>
                            );
                        })
                    }
                </div>
            </section> 

        </>
    ); 
}