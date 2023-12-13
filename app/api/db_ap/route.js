import mysql from 'serverless-mysql';

const database = mysql({
    config: {
        host: '127.0.0.1',
        port: 3306,
        user: 'anidubs1_admins',
        password: "4N4dm1nP455W0RDth4t1550H4RD",
        database: "anidubsbd"
    }
});


database.connect();

//sanitize SQL queries with LIKE keyword
function sanitizeLIKE(value){
    let percentage_escaped = value.replace(/\%/g,'\\%');
    return percentage_escaped.replace(/\"/g,'\"');
}

async function doQueryByField(table_name,columns,fields,short){
    //if the short is not 0, then do a LIMIT in SELECT
    //if the columns contain *, then, don't do the mapping
    if(!columns.find((value)=> value === '*')){
        columns = columns.map((value)=>{
            return `\`${value}\``;
        });
    }


    let sql = `SELECT ${columns.join()} FROM \`${table_name}\`` + (fields?`WHERE \`${fields.name}\` = '${fields.value}' `:"") + (short && short!==0?"" : `LIMIT ${short}`);
    
    let query_result = await database.query(sql);
    console.log("the query_result for doQuery is: ",query_result);
    return query_result;
}

async function doQueryLikeField(table_name,columns,field, short){
    //if the short is not 0, then do a LIMIT in SELECT
    //if the columns contain *, then, don't do the mapping
    if(!columns.find((value)=> value === '*')){
        columns = columns.map((value)=>{
            return `\`${value}\``;
        });
    }
    let sql = `SELECT ${columns.join()} FROM \`${table_name}\`` + (field && field.name && field.value? 
        ` WHERE \`${field.name}\` LIKE '%` + sanitizeLIKE(field.value) + "%'": "") + (short && short!==0?` LIMIT ${short}`: "");
    let query_result = await database.query(sql);
    console.log("the result from doQueryLikeField: ", query_result);
    return query_result;
}

export async function GET(req,res){
    const url = new URL(req.url);
    console.log("the params are: ",url.searchParams);
    console.log("the result of url.searchParams.get('param') is: ",url.searchParams.get('param'));
    const resultJSON = { values: {}};
    let query_result = await doQueryByField('anime_table',['id','anime_name','anime_season'],{name: 'anime_name', value: 'Spy X Family'},2);
    console.log("the query_result that was returned is: ",query_result);
    const response = new Response(JSON.stringify(resultJSON));

    if(url.searchParams.get('param')){
        switch(url.searchParams.get('param')){
            case 'search':{
                //if the searchParams have the HTTPS query: name, then do a query, else, dont
                if(url.searchParams.get('name')){
                  console.log("The name param exists: ",url.searchParams.get('name'));
                  query_result = await doQueryLikeField('anime_table',['id','anime_name','anime_season'],{name: 'anime_name', value: url.searchParams.get('name')},2);
                  console.log("The query_result is(like): ", query_result);
                }
            }
        }
    }

    return response;
}