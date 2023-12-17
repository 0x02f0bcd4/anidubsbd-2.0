import { useSession } from "next-auth/react";
//if the session is provided, then we show a button for their dashboard
//else, we provide a button for login

export default function Login(){
    const session = useSession();
    if(session && session.status === 'authenticated'){
        //if the session exists
        //then, we show the dashboard
        return (
            <>
                <a href="/dashboard"><button>Dashboard</button></a>
            </>
        );
    }
    return (
        <>
            <a href="/api/auth/signin"><button>Signin</button></a>
        </>
    );
}