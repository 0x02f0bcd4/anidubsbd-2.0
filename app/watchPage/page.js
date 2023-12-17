'use client';

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect,  useRef,  useState } from "react";


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
    console.log("the animeID and the episodeID is: ", animeID, episodeID);
    let form = new FormData();
        console.log("the userID is: ", userID);
        form.append('userID',userID);
        form.append('animeID',animeID);
        form.append('episodeID',episodeID);
        form.append('comment',comment);

    fetch('/api/user_DBAP',{
            method: 'POST',
            body: form
        }).then((response)=>{
            //the fetch request was succesful, fetch the comments again
            console.log("the response was: ", response.status);
            fetchComments(animeID,episodeID,newCommentSection);
        });
}

function LoadComment({animeID,episodeID})
{
    const userSession = useSession();
    const [postCommentJSX, setPostCommentJSX] = useState((<h2>Loading, please wait...</h2>));
    console.log("the episodeID Just got updated: ", episodeID);
    const commentRef = useRef();
    const [comments,setComments] = useState({
        empty:true
    });

    useEffect(()=>{
        fetchComments(animeID,episodeID,setComments); 
    },[episodeID]);

    const handleCommentSubmit = (event)=>{
        console.log("during event handling, the episodeID is: ", episodeID);
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
            setPostCommentJSX((<form action="/api/user_DBAP" method='post' onSubmit={handleCommentSubmit}>
                <label htmlFor="comment">Insert your comment here</label>
                <input type="text" minLength={2} maxLength={2000} autoComplete="off" episode-number={episodeID} ref={commentRef}/>
            </form>));
        }
    },[episodeID,userSession]);

    if(!comments){
        return (
            <>
                <h2>The comments couldn't be loaded, 
                    either because the comment section doesn't exist for this anime, or the anime doesn't exist
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
            <div>
                <h2>The comments are -</h2>
                {
                    comments.comments.map((value,index)=>{
                        return (
                            <h3 key={index}>{value.username} -&gt; {value.comment}</h3>
                        );
                    })
                }
            {postCommentJSX}
            
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
    }
    return(
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
    );
}