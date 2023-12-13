import { redirect } from "next/navigation";
import { options } from "../api/auth/[...nextauth]/option";
import { getServerSession } from "next-auth";
export default async function Page(){
    //get the session result
    const session = await getServerSession(options);
    //if the result exists
    if(session && session.user){
        return (
            <>
                <h2>Name: {user.name}</h2>
                <h2>Email: {user.email}</h2>
            </>
        );
    }

    //else, redirect to homepage
    redirect('/');
    //in case where the browser doesn't support redirection
    return (
        <>
            <h2>If your browser doesn't support redirection, <a href="/">Click here</a></h2>
        </>
    );
}