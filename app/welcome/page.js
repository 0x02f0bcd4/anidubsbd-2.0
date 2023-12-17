'use client';
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function Page(){
    const session = useSession();
    const usernameRef = useRef();
    const [showLengthError, setShowLengthError] = useState(false);
    const [isAvailable, setIsAvailble] = useState({status: 'notdecided'});
    const [username, setUsername] = useState(''); 

    //it means that the user isn't logged in
    if(session.status === 'unauthenticated'){
        redirect('/');
    }
    else if(session.status === 'loading'){
        return (
            <>
                <h2>Loading, please wait...</h2>
            </>
        )
    }
    else if(session.data.verified === true){
        redirect('/');
    } 

    const handleChecking = (event)=>{
        event.preventDefault();
        if(usernameRef.current.value.length < 5){
            if(showLengthError===false){
                setShowLengthError(true);
            }
        }
        else{
            fetch(`/api/user_DBAP?param=checkUsername&username=${usernameRef.current.value}`).then((response)=>{
                if(response.status===200){
                    setIsAvailble({status: 'available'});
                    setUsername(usernameRef.current.value);
                }
                else{
                    setIsAvailble({status: 'notavailable'});
                }
            });

            if(showLengthError === true){
                setShowLengthError(false);
            }
        }
    }; 
    
    const handleSelecting = (event)=>{
        event.preventDefault();
        if(usernameRef.current.value.length < 5){
            if(showLengthError === false){
                setShowLengthError(true);
            }
        }
        else{
            if(showLengthError === true){
                setShowLengthError(false);
            }
            if(isAvailable.status === 'available'){
                fetch(`/api/user_DBAP?param=insertUser&username=${username}&email=${session.data.user.email}&provider=${session.data.provider}&picture=${session.data.user.image}`);
                setUsername({status: 'done'});
                session.update({verified: true});
            }
        }
        
    }
    
    if(typeof(username)!=='string' && username.status === 'done'){
        console.log("redirecting");
        redirect('/');
    }
    else{
        console.log("not redirecting");
    }

    return(
        <>
            <h2>Welcome to the site, here you need to decide a new username</h2>
            <h2 style={showLengthError?{display: "block"}:{display: "none"}}>Your username needs to be at least 5 characters wide</h2>
            <h2 style={isAvailable.status==='notavailable'?{display: "block"}:{display: "none"}}>This username was taken</h2>
            <h2 style={isAvailable.status==='available'?{display: "block"}:{display: "none"}}>This username is available</h2>
            <form>
                <label htmlFor="checkusername">Check for username</label>
                <input type="text" id='checkusername' name='checkusername' placeholder="Enter your username" ref={usernameRef}/>
                <input type="submit" value="Decide" onClick={handleChecking}/>
                <input type="submit" value="set the value" onClick={handleSelecting} style={isAvailable.status==='available'?{color: "black"}:{color: 'grey'}}/>
            </form>
            
        </>
    );
}

