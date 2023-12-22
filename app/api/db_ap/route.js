import mysql from 'serverless-mysql';
import {writeFile} from 'fs/promises';
const database = mysql({
    config: {
        host: '127.0.0.1',
        port: 3306,
        user: 'anidubs1_admins',
        password: "4N4dm1nP455W0RDth4t1550H4RD",
        database: process.env.AnimeDB,
    }
});


database.connect();

async function doesTableExists(schema_name, table_name){
    //if the table exists, return true, else false
    let sql = 'SELECT * FROM `information_schema`.`tables` WHERE `table_schema` = '  + database.escape(schema_name) + ' AND `table_name` = ' + database.escape(table_name);
    let query_result = await database.query(sql);
    return Boolean(query_result[0]);
}


//sanitize SQL queries with LIKE keyword
function sanitizeLIKE(value){
    let percentage_escaped = value.replace(/\%/g,'\\%');
    return percentage_escaped.replace(/\"/g,'\"');
}


//this helper function takes an object which contains name and order field, and return a string 
//looks like '`name` order' to be used for ORDER field in SQL query
function orderToString(obj){
    return ` \`${obj.name}\` ${obj.order} `;
}

async function doQueryByField(table_name,columns,fields,short,order_list){
    //if the short is not 0, then do a LIMIT in SELECT
    //if the columns contain *, then, don't do the mapping
    let order_sql = '';
    if(!columns.find((value)=> value === '*')){
        columns = columns.map((value)=>{
            return `\`${value}\``;
        });
    }
    if(order_list){
        //make the SQL statement
        order_sql = ' ORDER BY' + ((order_list.map((value)=>{return orderToString(value)})).join());
    } 

    let sql = `SELECT ${columns.join()} FROM \`${table_name}\`` + (fields?` WHERE \`${fields.name}\` = '${fields.value}' `:"")  + order_sql + (Boolean(short)? ` LIMIT ${short}`: "") ;
    
    let query_result = await database.query(sql);
    return query_result;
}

async function doQueryLikeField(table_name,columns,field, short,order_list){
    //if the short is not 0, then do a LIMIT in SELECT
    //if the columns contain *, then, don't do the mapping
    let order_sql = '';
    if(!columns.find((value)=> value === '*')){
        columns = columns.map((value)=>{
            return `\`${value}\``;
        });
    }

    if(order_list){
        //make the SQL statement
        order_sql = ' ORDER BY' + ((order_list.map((value)=>{return orderToString(value)})).join());
    }
    let sql = `SELECT ${columns.join()} FROM \`${table_name}\`` + (field && field.name && field.value? 
        ` WHERE \`${field.name}\` LIKE '%` + sanitizeLIKE(field.value) + "%'": "") + order_sql +(short && short!==0?` LIMIT ${short}`: "");
    let query_result = await database.query(sql);
    return query_result;
}



//get all the information about the anime
async function getInfos(id){
    //first, get the general informations
    let sql = `SELECT \`anime_table\`.*, \`genre_id\` FROM \`anime_table\` INNER JOIN \`anime_genre\` ON \`anime_id\` = ${id} WHERE \`id\` = ${id}`;
    let query_result = await database.query(sql);
    if(query_result[0]){
    	let returnStruct = {values:{
        	...query_result[0]
    	}};
	
    	let genre_ids = (query_result.map((value)=>{
        	return value.genre_id;
    	})).join();
    	//now, get all the genre_name
    	sql = 'SELECT `genre_name` FROM `genre_table` WHERE `id` IN (' + genre_ids + ')';
    	query_result = await database.query(sql);
	
    	returnStruct.values.anime_genres = query_result.map(value=>value.genre_name);
    	//get the anime name
    	sql = 'SELECT `id`,`anime_name`,`anime_season` FROM `anidubsbd`.`anime_table` WHERE `id` IN (SELECT `anime_id` FROM `anidubsbd`.`anime_genre` WHERE `genre_id` IN (' + genre_ids + ')) ORDER BY `priority`,`anime_totalview` DESC LIMIT 6';
    	query_result = await database.query(sql);
    	returnStruct.see_more = query_result;
    	returnStruct.values.genre_id = null; 
   	 
    	return returnStruct;
    }


    return null;
}
export async function ServerSideRequests_anime(requestType, requestParam){
    let response = {status: 0, statusText: ''};
    switch(requestType){

        case 'getAnimeForMetadata':{
            let sql = 'SELECT `anime_name`,`anime_season`,`anime_type` FROM `anime_table` WHERE `id` = ' + database.escape(requestParam.id);
            let query_result = await database.query(sql);
            if(query_result.length>0){
                response.status = 200;
                response.statusText = 'OK!';
                response.values = query_result;
            }
            else{
                response.status = 404;
                response.statusText = 'Not found';
            }
            break;
        }
        case 'getAnimeByID':{
            let sql = 'SELECT `id`,`anime_name`,`anime_season` FROM `anime_table` WHERE `id` in ?' ;
            console.log("the sql was: ", sql);
            let values = [requestParam.animeIDs.map((value)=>value.id)];
            let query_result = await database.query(sql,[values]);
            response.values = query_result;
            if(query_result.length>0){
                response.status = 200;
                response.statusText = 'OK';
            }
            else{
                response.status = 404;
                response.statusText = 'No anime found';
            }
            break;
        }
        case 'getAnimeByGenre':{
            //the genre name will be lower case in the database too
            let sql = 'SELECT `id` FROM `genre_table` WHERE `genre_name` = ' + database.escape(requestParam.genre_name);
            let query_result = await database.query(sql);
            if(query_result[0]){
                //the genre id was found
                sql = `SELECT \`anidubsbd\`.\`anime_table\`.\`id\`,\`anime_name\`,\`anime_season\` FROM \`anidubsbd\`.\`anime_table\` INNER JOIN \`anidubsbd\`.\`anime_genre\` ON \`anime_id\`=\`anidubsbd\`.\`anime_table\`.\`id\` AND \`genre_id\` = ` + query_result[0].id;
                query_result = await  database.query(sql);
                response.status = 200;
                response.statusText = 'OK';
                response.values = query_result;
            }
            else{
                response.status = 404;
                response.statusText = 'Not found';
            }
            break;     
        }
        case 'getTabInfo':{
            const param = requestParam.pagetype;
                if(param ==='trending'){
                    //if it's the nigga in the hood, don't send any other nigga
                    response.values = await doQueryByField('anime_table',['id','anime_name','anime_season'],null,0,[{name: 'priority', order: 'ASC'},{name: 'anime_totalview', order: 'DESC'}]);
                }
                else if( param ==='newest')
                {
                    response.values = await doQueryByField('anime_table',['id','anime_name','anime_season'],null,0,[{name: 'priority', order: 'ASC'},{name: 'anime_insertion_date', order: 'DESC'}]);
                }
                else{

                    response.values = await doQueryByField('anime_table',['id','anime_name','anime_season'],{name: 'anime_type', value: param},0,[{name: 'priority', order: 'ASC'}, {name: 'anime_totalview', order: 'DESC'}]);
                }
                
                response.status = 200;
                response.statusText = 'OK';
                break;

        }
            case 'info':{
                    let resultJSON = await getInfos(requestParam.id);
                    if(resultJSON)
                    {
                        response.status = 200;
                        response.statusText = 'OK';
                        response.values = resultJSON;
                    }
                    else{
                        response.status = 404;
                        response.statusText = 'Not found';
                    }  
               break;
            }
        case 'incrementViewCounter':{
            let sql = `UPDATE \`anime_table\` SET \`anime_totalview\` = \`anime_totalview\` +1 WHERE \`id\`  = ${requestParam.id}`;
            database.query(sql);
            response.status = 200;
            response.statusText = "OK";
            break;
        }
        case 'verifyAnime':{
            response.values = {};
            let sql = 'SELECT `id`, `anime_name`, `anime_season` FROM `anidubsbd`.`anime_table` WHERE `id`= ' +database.escape(requestParam.animeID);
            let query_result = await database.query(sql);
            response.values = {...query_result[0]};
            if(response.values.exists = Boolean(query_result[0])){
                //the anime exists, get the animeID with related genre
                sql = 'SELECT `genre_id` FROM `anime_genre` WHERE `anime_id` = ' + requestParam.animeID;
                query_result = await database.query(sql);
                //make the genre array
                let genre_ids = (query_result.map((value)=>value.genre_id)).join();
                sql = 'SELECT `id`,`anime_name`,`anime_season` FROM `anidubsbd`.`anime_table` WHERE `id` IN (SELECT `anime_id` FROM `anidubsbd`.`anime_genre` WHERE `genre_id` IN (' + genre_ids + ')) ORDER BY `priority`,`anime_totalview` DESC LIMIT 6';
                query_result = await Promise.all([doQueryByField(`anime_${requestParam.animeID}_watchdetails`,['*']),database.query(sql)]);
                response.values.episode_list = query_result[0];
                response.values.see_more = query_result[1];
            } 
            break;
        }
        case 'verifyAnimeAndEpisode':{
            response.status = 404;
            response.statusText = 'not found';
            if((await doesTableExists('anidubsbd',`anime_${requestParam.animeID}_watchdetails`))){
                //the table exists now check if the episode exists
                let sql = `SELECT \`id\` FROM \`anime_${requestParam.animeID}_watchdetails\` WHERE \`id\` = ${requestParam.episodeID}`;
                const query_result = await database.query(sql);
                if(query_result[0]){
                    //alright, everything exists, prepare for an insertion
                    response.status = 200;
                    response.statusText = 'found';
                }
                
            }
            
            break;
        }
        case 'insertComment':{
            let sql = 'INSERT INTO `anime_comments` (`anime_id`,`episode_id`,`user_id`,`comment`) VALUES ?';
            let values = [[requestParam.animeID, requestParam.episodeID, requestParam.userID, requestParam.comment]];
            let query_result = await database.query(sql, [values]);
            console.log("the comment insertion query_result was: ", query_result);
            response.status = 200;
            response.statusText = 'OK';
            break;
        }
    }
    await database.end();
    return response;
}




export async function GET(req,res){
    const url = new URL(req.url);
    let response = new Response('',{status: 200, statusText: "Not found, make sure you entered correct parameter names and values"});
    let resultJSON = { values: {}};


    if(url.searchParams.get('param'))
    {
        switch(url.searchParams.get('param')){
            case 'search':{
                //if the searchParams have the HTTPS query: name, then do a query, else, dont
                if(url.searchParams.get('name')){
                  let short = parseInt(url.searchParams.get('short')); 
                  let query_result = await doQueryLikeField('anime_table',['id','anime_name','anime_season'],{name: 'anime_name', value: url.searchParams.get('name')},short,[{name: 'priority', order: 'ASC'},{name: 'anime_totalview', order: 'DESC'}]);
                  resultJSON.values = query_result;
                  response = new Response(JSON.stringify(resultJSON));
                }
                break;
            }

            

            case 'trending':
            case 'newest':
            case 'bsub':
            case 'bdub':
            case 'edub':
            {
                const param = url.searchParams.get('param');
                if(param ==='trending'){
                    //if it's the nigga in the hood, don't send any other nigga
                    resultJSON.values = await doQueryByField('anime_table',['id','anime_name','anime_season'],null,6,[{name: 'priority', order: 'ASC'},{name: 'anime_totalview', order: 'DESC'}]);
                }
                else if( param ==='newest')
                {
                    resultJSON.values = await doQueryByField('anime_table',['id','anime_name','anime_season'],null,6,[{name: 'priority', order: 'ASC'},{name: 'anime_insertion_date', order: 'DESC'}]);
                }
                else{

                    resultJSON.values = await doQueryByField('anime_table',['id','anime_name','anime_season'],{name: 'anime_type', value: param},6,[{name: 'priority', order: 'ASC'}, {name: 'anime_totalview', order: 'DESC'}]);
                }
                
                response = new Response(JSON.stringify(resultJSON));
                break;
            }
            case 'comments':{
                const animeID = parseInt(url.searchParams.get('animeID'));
                const episodeID = parseInt(url.searchParams.get('episodeID'));
                if(animeID && episodeID){
                    /*let sql = `SELECT \`name\`,\`comment\` FROM \`anidubsbd\`.\`anime_${animeID}_comments\` INNER JOIN `+ 
                    ` \`users\`.\`users\` ON \`anidubsbd\`.\`anime_${animeID}_comments\`.\`user_id\` = \`users\`.\`users\`.\`id\` `+ 
                    ` WHERE \`anidubsbd\`.\`anime_${animeID}_comments\`.\`anime_episode\` = ${episodeID}`;*/
                    let sql = `SELECT \`username\`,\`comment\` FROM \`anidubsbd\`.\`anime_comments\` INNER JOIN \`users\`.\`users\` ON `+
                    `\`anidubsbd\`.\`anime_comments\`.\`user_id\` = \`users\`.\`users\`.\`id\` WHERE` + 
                    ` \`anidubsbd\`.\`anime_comments\`.\`anime_id\` = ${animeID} AND` +
                    ` \`anidubsbd\`.\`anime_comments\`.\`episode_id\` = ${episodeID}`;
                    resultJSON.values = await database.query(sql);
                    console.log("the resultJSON is: ", resultJSON.values);
                    response = new Response(JSON.stringify(resultJSON)); 
                }
                else{
                    response = new Response("Bad request, the request doesn't contain necessary parameters, or the values isn't correct", {status: 400, statusText: "Bad request"});
                }
                break;
            } 
            case 'getGenres':{
                let sql = 'SELECT * FROM `genre_table`';
                let query_result = await database.query(sql);
                resultJSON.values = query_result;
                response = new Response(JSON.stringify(resultJSON),{status: 200, statusText: 'OK'});
                break;
            }
        }
    }
    database.end();
    return response;
}

