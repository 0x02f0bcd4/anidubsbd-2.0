'use client';

import { useEffect, useRef, useState } from "react";


function Component(){
    const IDREF = useRef();
    const PWREF = useRef();
    const ActionFormRef = useRef();
    const [genres,setGenres] = useState({empty: true});
    console.log("the cookies are: ", document.cookie);
    const [isAuthorized,setIsAuthorized] = useState(Boolean(document.cookie));
    const [authFailed, setAuthFailed ] = useState(false);
    const [formOption, setFormOption] = useState(0);
    useEffect(()=>{
        fetch('/api/db_ap?param=getGenres').then((response)=>{
            return response.json();
        }).then((json)=>{
            setGenres({empty: false, values: json.values()});
        });
    },[]);
    if(!isAuthorized){
        const handleFormSubmit = (event)=>{
            event.preventDefault();
            let formdata = new FormData();
            formdata.append('adminID',IDREF.current.value)
            formdata.append('adminPassword',PWREF.current.value);
            fetch('/api/user_DBAP',{
                method: 'POST',
                body: formdata
            }).then((response)=>{
                if(response.status === 200)
                {
                    //sessionStorage.setItem('authorizedAdmin', 'true');
                    document.cookie = 'adminAuthorized=true';
                    setIsAuthorized(true);
                }
                else{
                    //the authorization failed
                    setAuthFailed(true);
                }
            });
        };
            return (
            <>
            <h2 style={authFailed?{display: "block", color: "red"}:{display: "none"}}>The authentication failed</h2>
            <form onSubmit={handleFormSubmit}>
                <label htmlFor="adminID">Insert admin ID</label>
                <input type="text" id="adminID" name="adminID" ref={IDREF} autoComplete="off"/>
                
                <label htmlFor = 'adminPassword'>Insert admin password</label>
                <input type='text' id='adminPassword' name='adminPassword' autoComplete="off" ref={PWREF}/>
                
                <input type='submit' value='GO!'/>
            </form>
            </>
        );
    } 

    const handleActionForm = (event)=>{
        event.preventDefault();
        const option = parseInt(ActionFormRef.current.elements.namedItem('action-type').value);
        console.log('the option is: ', option);
        setFormOption(option);
    };


    return (
        <>
            <h2>Select your action type below</h2>
            <h2>Revise and read any action before you proceed</h2>
            <h2>Before you insert an anime/episode, get the list of anime/episode by selecting the option</h2>
            <form id='action-form' onSubmit={handleActionForm} ref={ActionFormRef}>
                <label htmlFor="action-type">Choose an action</label>
                <select id="action-type" name='action-type' form="action-form">
                    <option value='1'>Insert an anime</option>
                    <option value='2'>Update an anime</option>
                    <option value='3'>Insert an episode</option>
                    <option value='4'>Update an episode</option>
                    <option value='5'>Get anime list</option>
                    <option value='6'>Get episode list</option>
                </select>
                <input type='submit' id='submit' name='submit' value='Submit the query'/>
            </form>

            <div style={formOption===1?{display: 'block'}:{display: 'none'}}>
            <form id='insertForm' action="/api/db_ap" method='POST'>
                <input type='hidden' name='param' value='insertAnime'/>
                
                <label htmlFor="anime_name">Insert the anime name</label>
                <input type='text' name='anime_name' id='anime_name'/>
                <br/>
                <label htmlFor="anime_season">Insert the anime season</label>
                <input type='text' name='anime_season' id='anime_season'/>
                <br/>

                <label htmlFor="anime_type">Insert the anime type</label>
                <select id='anime_type' name='anime_type' form="insertion-form">
                    <option value='BDUB'>Bangla dub</option>
                    <option value='BSUB'>Bangla sub</option>
                    <option value='EDUB'>English dub</option>
                </select>
                <br/>
                <label htmlFor="anime_studio">Insert the name of the production studio</label>
                <input type='text' name='anime_studio' id='anime_studio'/>
                <br/>
                <label htmlFor="anime_dubbing_studio">Insert the name of anime dubbing/subbing studio: </label>
                <input type='text' name='anime_localizing_studio' id='anime_dubbing_studio'/>
                <br/>
                <label htmlFor="anime_insertion_date">Insert the date of insertion(most probably it's today)</label>
                <input type='date' name='anime_insertion_date' id='anime_insertion_date'/>
                <br/>
                <label htmlFor="anime_description">Insert the description</label>
                <input type='text' name='anime_descripton' id='anime_description' style={{width: '90vw', height: '5rem'}}/>
    
                <br/>
                <label htmlFor="priority">Insert the priority(the lesser, the more priority it gets). Must be an integer</label>
                <input type='number' step='1'/>
                <br/>
                <input type='submit' name='submit' value='submit'/>
            </form>
            </div>
            
            <div style={formOption===2?{display: 'block'}:{display:'none'}}>
                <form id='updateForm' action='/api/db_ap' method="post">
                    <input type='hidden' name='param' value='updateAnime'/>
                    <label htmlFor="id">Insert the id</label>
                    <input type='number' id='id' name='id' step='1'/>
                    <br/>
                    <label htmlFor="updateType">Select the update type</label>
                    <br/>
                    <select id='updateType' form='updateForm' name='type'>
                        <option value='anime_name'>Anime name</option>
                        <option value='anime_season'>Anime season</option>
                        <option value='anime_studio'>Production studio</option>
                        <option value='anime_localizing_studio'>Dubbing/Subbing studio</option>
                        <option value='priority'>Priority</option>
                        <option value='anime_insertion_date'>Insertion date</option>
                        <option value='anime_type'>Anime type</option>
                        <option value='anime_description'>Anime description</option>
                    </select>
                    <br/>

                    <label htmlFor="updateValueType">If you are updating anime type, insert it here</label>
                    <select id='updateValueType' form='updateForm' name='updateValueType'>
                        <option value='BDUB'>Bangla Dub</option>
                        <option value='BSUB'>Bangla Sub</option>
                        <option value='EDUB'>English Dub</option>
                    </select>
                    <br/>
                    <label htmlFor='updateValueDate'>If you are updating date, insert it here</label>
                    <input type='date' id='updateValueDate' name='updateValueDate'/>
                    <br/>
                    <label htmlFor="updateValueText">Else, insert the text</label>
                    <input type='text' id='updateValueText' name='updateValueText'></input>
                    <br/>
                    <input type='submit' name='submit' value='submit'/>
                </form>
            </div>
            <div style={formOption===3?{display: 'block'}:{display: 'none'}}>
                <form action="/api/db_ap" method='post' id='insertEpisode'>
                    <input type='hidden' name='param' value='insertEpisode'/>
                    <label htmlFor="episodeID">
                        Insert the episode number
                    </label>
                    <input type='number' step='1' name='id' id='episodeID'></input>
                    <br/>

                    <label htmlFor="episodeName">
                        Insert the episode name 
                    </label>
                    <input type='text' name='episode_name' id='episodeID'></input>
                    <br/>

                    <label htmlFor="episodeURL">
                        Insert the episode URL
                    </label>
                    <input type='text' name='episode_url' id='episodeURL'></input>
                    <br/>
                    <input type='submit' name='submit' value='submit'/>
                </form>
            </div>
            <div style={formOption===4?{display: 'block'}:{display:'none'}}>
                <form action='/api/db_ap' method="post" id='updateEpisode'>
                    <input type='hidden' name='param' value='updateEpisode'/>
                    <label htmlFor="updateType">
                        Select the type of update you want to make
                    </label>
                    <select form='updateEpisode' name='updateType'>
                        <option value='id'>ID</option>
                        <option value='episode_name'>Episode name</option>
                        <option value='episode_url'>Episode URL</option>
                    </select>
                    <br/>
                    
                    <label htmlFor="updateTypeID">
                        If you are updating ID, put it here
                    </label>
                    <input type='number' step='1' id='updateTypeID' name='updateTypeID'/>
                    <br/>

                    <label htmlFor="updateTypeText">
                        Else, put it here
                    </label>
                    <input type='text' id='updateTypeText' name='updateTypeText'/>
                    <br/>
                    <input type='submit' name='submit' value='submit'/>
                </form>
            </div>
        </>
    )
}
export default function Page(){
    //check if the cookies is set
    
    return (
        <>
            <Component/>
        </>
    )
}