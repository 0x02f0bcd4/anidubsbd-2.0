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
                <div className={styles.dashboard}>
                    <h2>User information</h2>
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
                    <a href='/api/auth/signout'>Signout</a>
                </div> 
            <div className={styles.watchlist_tab}>
            	<div className={styles.title}>
                	<h2>Watchlist</h2>
            	</div>
            	{
                    watchlist.status === 200?(
            		    <div className={styles.cards}>
                			<div className={styles.items}>
                    			{
                        			watchlist.values.map((value) => {
                                        let fullname = value.anime_name + (value.anime_season?' '+value.anime_season:value.anime_season);
                            			return (
                                			<a className={styles.item_div} key={value.id} href={`/animeInfo?id=${value.id}`}>
                                    			<img src={`/Posters/${fullname} Poster.jpg`} alt={fullname}/>
                                    			<span className="anime_name">{fullname}</span>
                                			</a>
                            			)
                        			})
                    			}
                			</div>
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
            <h2>You still haven&apos;t completed your signing in process. Visit <a href="/welcome" style={{textDecoration: "none", color: 'orangered'}}>here to complete your signing up process</a></h2>
        </>
    ); 
}
