import React, { useEffect, useState } from 'react'


function Search() {
    const [formField,setFormField] = useState('');
    const [currentSearchTerm,setCurrentSearchTerm] = useState('');
    const [searchResults,setsearchResults] = useState([]);
    useEffect(()=>{
            const fetchSearchResult = async()=>{
                if(formField.length>0){
                    if(currentSearchTerm.length===0){
                        setCurrentSearchTerm(formField);
                    }
                    else if(!currentSearchTerm.includes(formField)){
                        setCurrentSearchTerm(formField);
                        const response = await fetch(`/api/db_ap?param=search&name=${formField.replace(/\s/g,'+')}&short=4`);
                        setsearchResults((await response.json()).values);
                    }
                }
                else if(currentSearchTerm.length){
                    //form field is empty, but the currentSearchTerm isn't
                    setCurrentSearchTerm('');
                    setsearchResults([]);
                }
            }

            fetchSearchResult();
    },[formField]);

    const handleChange = (event)=>{
        setFormField(event.target.value);
    };


    //if on lower resolution device, no need to show immediate result
  return (
    <> 
    <form className="rounded-xl overflow-hidden w-full h-full" action="/searchPage" method="get">
        <input type="text" name="name" placeholder='অ্যানিমে খুঁজুন' value={formField} onChange={handleChange} autoComplete="off" className="focus:outline-none w-full h-full bg-slate-900 text-center text-cyan-400 placeholder:text-cyan-400" /> 
         
    </form>
    <div className="mt-2 z-[50] rounded-xl relative flex flex-col bg-slate-400">
            {
                searchResults.map((value)=>{
                    let fullname = value.anime_name + (value.anime_season? ' '+value.anime_season:'');
                    return (
                        <a className="pl-2 my-2 w-[90%] flex flex-row items-center" href={`/animeInfo?id=${value.id}`} key={value.id}>
                            <img className="rounded max-w-[10%]" src={`/Posters/${fullname} Poster.jpg`} alt={`Poster for ${fullname}`}/>
                            <p className="text-slate-900 pl-2">{fullname}</p>
                        </a>
                    )
                })
            }
    </div>
    </>
  )
}

export default Search;