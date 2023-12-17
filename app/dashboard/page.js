import { options } from "../api/auth/[...nextauth]/option";
import { getServerSession } from "next-auth";
export default async function Page(){
    //get the session result
    console.log("we are good up until this part(before getServerSession): ");
    const session = await getServerSession(options);
    console.log("the session is: ", session);

    //check if the user exists in the database
    console.log("we are good up until this part: ");
    if(session.verified === true){
        //the user was found, show the data
        //parse the sent JSON
        let response = await fetch(`http://127.0.0.1:3000/api/user_DBAP?param=getUser&email=${session.user.email}&provider=${session.provider}`)
        const userData = await response.json();
        console.log("the userData is: ", userData);
        return (
            <>
                <h3>UserID is: {userData.id}</h3>
                <h2>Username is: {userData.username}</h2>
                <h2>Email is: {userData.email}</h2>
                <h2>Signed up using: {userData.provider}</h2>
                <h2><a href="/api/auth/signout">Signout</a></h2>
            </>
        );
    }

    return (
        <>
            <h2>You still haven't completed your signing in process. Visit <a href="/welcome">here to complete your signing up process</a></h2>
        </>
    ); 
}