import { redirect } from "next/navigation";
import HeaderClient from "@/components/search/header_client";
import styles from "./searchPage.module.css";

export default async function SearchPage({searchParams}){
    const paramResult = searchParams.name;
    if(!paramResult){
        //no name tag was found, redirect to homepage
        redirect("/");
        //if redirection isn't supported by browser
        return(
            <>
                <h2>রাতের আঁধারে একা একা হাঁটে না, <a href="/">বাসায় যাও</a></h2>
            </>
        );
    }

    const result = await fetch(`${process.env.baseURL}/api/db_ap?param=search&name=${paramResult}`, {
        next:{
            revalidate: 60,
    }});
    const json = await result.json();
    
    //the parameter exists, let's fetch the data
    return (
        <>
            <HeaderClient/>
            <div style={{marginTop: '20px'}}>
                <h2 style={{marginTop: '20px', display: "inline", color: "whitesmoke"}}>Searched for</h2> <h3 style={{display: "inline", color: "whitesmoke"}}>{paramResult}</h3>
            </div>
            <div className={styles.tabpage}>
                {
                    json.values.map((value) =>{
                        let fullname = value.anime_name + (value.anime_season?" "+value.anime_season: "");
                        return (
                            <a className={styles.tabpage_item} href={`/animeInfo?id=${value.id}`} key={value.id}>
                                <img src={`/Posters/${fullname} Poster.jpg`} alt={fullname}/>
                                <span>{fullname}</span>
                            </a>
                        );
                    })
                }
            </div>
        </>
    );
}