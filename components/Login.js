import { useSession } from "next-auth/react";
//if the session is provided, then we show a button for their dashboard
//else, we provide a button for login


export default function Login({className}){
    const session = useSession();
    if(session && session.status === 'authenticated'){
        return (
            <div className={className}>
                <a href='/dashboard' className="flex flex-row justify-center items-center w-full h-full text-sm pl-2 font-bold"><button>Dashboard!</button></a>
            </div>
        );
    }


    return (
        <div className={className}>
            <a href='/api/auth/signin' className="flex flex-row justify-center items-center w-full h-full text-sm pl-2 font-bold"><button>Signin</button></a>
        </div>
    );
}


export function LoginHamburger(){
    const session = useSession();
    if(session && session.status === 'authenticated'){
        return (
            <div className="my-2">
                <a href="/dashboard" className="text-xl text-lime-300">Dashboard</a>
            </div>
        );
    }


    return (
        <div className="my-2">
            <a href='/api/auth/signin' className="text-xl text-cyan-400"><button>Signin</button></a>
        </div>
    )
}