import { redirect } from "next/navigation";
import HeaderClient from "@/components/search/header_client";

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

    const request = `${process.env.baseURL}api/db_ap?param=search&name=${paramResult}`;
    const result = await fetch(request, {
        next:{
            revalidate: 60,
    }});
    const json = await result.json();
    
    //the parameter exists, let's fetch the data
    return (
        <>
            <HeaderClient/>
            
            <div className="mt-4 w-[95%] mx-auto">
                <h2 className="mt-2 mx-3 text-4xl text-center border-b border-slate-400 border-solid">Searched for <span className="text-2xl text-cyan-400">{paramResult}</span></h2>
                <div>
                {
                    json.values.length===0?(
                        <h2 className="text-xl mt-2 text-center">
                            No result for <span className="text-red-400">{paramResult}</span>
                        </h2>
                    ):(
                        <div className="mt-4 grid gap-2 w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 grid-flow-row">
                            {
                                json.values.map((value)=>{
                                    let fullname = value.anime_name + (value.anime_season?" "+value.anime_season:'');
                                    
                                    return (
                                        <a key={value.id} className="flex w-full flex-col justify-around items-center p-2 bg-slate-600 bg-opacity-40" href={`/animeInfo?id=${value.id}`}>
                                            <img className="max-h-[80%] max-w-full" src={`/Posters/${fullname} Poster.jpg`} alt={`Poster for ${fullname}`}/>
                                            <p className="w-[95%] text-xl whitespace-nowrap text-center overflow-hidden text-ellipsis m-0 p-0">{fullname}</p>
                                        </a>
                                    );
                                })
                            }
                        </div>
                    )
                }
                </div>
            </div>

        </>
    );
}