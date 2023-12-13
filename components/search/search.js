import React, { useEffect, useState } from 'react'
import styles from "./search.module.css";
function Search({onLowerDevice}) {
    const [formField,setFormField] = useState('');
    const [currentSearchTerm,setCurrentSearchTerm] = useState('');
    const [searchResults,setsearchResults] = useState([]);
    useEffect(()=>{
        //if not on lower resolution device, fetch search result(we are still not done yet, keep reading)
        if(!onLowerDevice){
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
        }
    },[formField]);

    console.log("the search Results are: ",searchResults);
    console.log("formField is: ",formField);
    const handleChange = (event)=>{
        setFormField(event.target.value);
    };


    //if on lower resolution device, no need to show immediate result
  return (
    <form className={styles.searchbar} action="/searchPage" method="get">
        <input type="text" name="name" placeholder='অ্যানিমে খুঁজুন' value={formField} onChange={handleChange} autoComplete="off"/>

        <div className={styles.searchResult}>
            {
                searchResults.map((value,index)=>{
                    return (
                        <a key={index} href={`/animeInfo?id=${value.id}`}>{value.anime_name}</a>
                    )
                })
            }
        </div>
    </form>
  )
}

export default Search;