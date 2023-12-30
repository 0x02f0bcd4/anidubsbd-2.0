import { options } from "../api/auth/[...nextauth]/option";
import { getServerSession } from "next-auth";
import { ServerSideRequests_user } from "../api/user_DBAP/route";
import HeaderClient from "@/components/search/header_client";
import styles from './dashboard.module.css';


//now, let the robot not to index, or come to this page
export const metadata = {
 robots: {
    index: false,
    follow: true,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};


export default async function Page(){
    //get the session result
    const session = await getServerSession(options);
    if(session.verified === true){
        //the user was found, show the data
        //get the watchlist
        const watchlist = await ServerSideRequests_user('getWatchlist',{userID: session.user.userID}); 
        const dataArray = [{name: 'UserID',value: session.user.userID},{name: 'Username', value: session.user.username}
                          ,{name: 'Email',value: session.user.email},{name: 'Authenticated using', value: session.provider.toUpperCase()}];
        return (
            <>
                <HeaderClient/>
                <div className="mt-4 mx-2 rounded border border-slate-400">
                    <h2 className="text-xl border-b border-slate-400 mx-4 text-center mt-1">User information</h2>
                    <div>
                        {
                            dataArray.map((value)=>{
                                return (
                                    <div key={value.name} className={styles.userinfo_item}>
                                        <span>{value.name}</span>
                                        <h4>{value.value}</h4>
                                    </div>
                                );
                            })
                        }
                    </div>
                    <p className="text-center p-2 mb-1"><a href='/api/auth/signout' className="p-2 bg-slate-900 rounded m-2 text-center text-xl text-red-500">Signout</a></p>
                </div> 
            <div className="mx-auto w-98vw my-4">	
                <h2 className="mx-2 text-center border-b border-slate-400 text-xl text-cyan-400">Watchlist</h2>
            	{
                    watchlist.status === 200?(	
                        <div className="my-2 min-[550px]:flex flex-row justify-center flex-wrap gap-2"> 
                            {
                                watchlist.values.map((value)=>{
                                    let fullname = value.anime_name + (value.anime_season?" "+value.anime_season:"");
                                    return (
                                        <a key={value.id} href={`/animeInfo?id=${value.id}`} className="border border-slate-400 rounded flex flex-row min-[550px]:flex-col min-[550px]:justify-between items-center p-1 my-2 h-[20svh] min-[550px]:max-w-[150px] min-[550px]:h-[250px]">
                                            <img className="h-full pl-2 min-[550px]:pl-0 min-[550px]:max-w-full min-[550px]:max-h-[85%]" src={`/Posters/${fullname} Poster.jpg`} alt={`Poster of ${fullname}`}/>
                                            <p className="text-lg pl-2 whitespace-nowrap overflow-hidden text-ellipsis min-[550px]:w-[80%]">{fullname}</p>
                                        </a>
                                    );
                                })
                            }
                        </div>
                    ):
                    (
                        <h2>কিছু দেখলে না বলতে পারবো যে কি কি দেখেছেন  :-)</h2>
                    )
            	}
           	 
        	</div>

            </>
        );
    }

    return (
        <>
            <HeaderClient/>
            <h2 className="w-[98vw] mx-auto mt-4 text-xl">You still haven&apos;t completed your signing in process. Visit <a href="/welcome" className="text-cyan-400">here to complete your signing up process.</a></h2>
        </>
    ); 
}
