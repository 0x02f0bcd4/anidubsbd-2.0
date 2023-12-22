import mysql from "serverless-mysql";
import bcrypt from "bcrypt";
import {sha256} from "js-sha256";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/option";
import { ServerSideRequests_anime } from "../db_ap/route";
import { cookies } from "next/headers";
const database = mysql({
    config:{
        host: "127.0.0.1",
        port: 3306,
        user: "anidubs1_admins",
        password: "4N4dm1nP455W0RDth4t1550H4RD",
        database: process.env.UserDB
    },
    library: require("mysql2")
});



database.connect();


export async function ServerSideRequests_user(requestType,requestParam){
    let response = {status: 200, statusText: '', values: {}};
    switch(requestType){ 
        case 'getUserByEmail':{
            //check if the user already exists with the same email and provider
            let sql = 'SELECT * FROM `users` WHERE `email` = ' + database.escape(requestParam.email) + ' and `provider` = ' + database.escape(requestParam.provider);
            let query_result = await database.query(sql);
            response.status = query_result[0]?200:404;
            response.statusText = response.status===200?'found': 'not found';
            response.values = query_result[0];
            break;
        } 

        case 'getWatchlist':{
            //get the ID and wait for the list of animeID we get
            let sql = 'SELECT `id` FROM `user_' + database.escape(requestParam.userID) + '_watchlist`';
            let query_result = await database.query(sql);
            //now call the ServerSideRequests_anime to get the anime id, anime_name, and anime_season
            if(query_result.length === 0){
                response.status = 404;
                response.statusText = 'Not found';
                response.values = {};
                break; //early switch case break;
            }
            response =  await ServerSideRequests_anime('getAnimeByID',{animeIDs: query_result});
            break;
        }
        case 'getReviewByID':{
            let sql = `SELECT \`review\` FROM \`user_${requestParam.userID}_watchlist\` WHERE \`id\`=${requestParam.animeID}`;
            let query_result = await database.query(sql);
            if(!query_result[0]){
                response.values.watched = false;
            }
            else{
                response.values.watched = true;
                response.values.review = query_result[0].review;
            }
            break;
        }
    }
    return response;
}

export async function GET(req){
    const url = new URL(req.url);
    let response = undefined; 
    switch(url.searchParams.get('param')){
        case 'we':{
            const animeID = parseInt(url.searchParams.get('animeID'));
            if(animeID){
                //verify the anime
                //and see if the user is logged in
                let promises = await Promise.all([ServerSideRequests_anime('verifyAnime',{animeID: animeID}),getServerSession(options)]);
                if(promises[0].values.exists){
                    if(promises[1]){
                        let sql = `INSERT INTO \`user_${promises[1].user.userID}_watchlist\` SET \`id\` = ${animeID}`;
                        database.query(sql,function(err){
                            if(!err){
                                ServerSideRequests_anime('incrementViewCounter',{id: animeID});
                            }
                        });
                    }
                    
                    response = new Response(JSON.stringify(promises[0]),{status: 200, statusText: "OK"});
                } 
                else{
                    console.error("Error: no anime was found with this animeID: ");
                    response = new Response("Error: no anime was found with this animeID",{status: 404, statusText: "Not found"});
                }
            }
            else{
                console.error("no animeID was provided");
                response = new Response("animeID was missing or malformed",{status: 400, statusText: "The animeID was malformed/not provided"});
            }
            break;
        }
        case 'getUser':{
            const email = url.searchParams.get('email');
            const provider = url.searchParams.get('provider');
            if(email && provider){
                let sql = 'SELECT * FROM `users` WHERE `email` = ' + database.escape(email) + ' AND `provider` = ' + database.escape(provider);
                let query_result = await database.query(sql);
                if(query_result[0]){
                    response = new Response(JSON.stringify(query_result[0]),{status: 200, statusText: 'OK'});
                }
                else{
                    response = new Response('not found',{status: 404, statusText: "Not found"});
                }
            }
            else{
                response = new Response("bad request, either the required query parameter wasn't provided or malformed",{status: 400, statusText: "Bad request, either the required query parameter wasn't provided or was malformed"});
            }
            break;
        }
        case 'doesUserExistByID':
        {
            let sql = 'SELECT `id` FROM `users` WHERE `id` = ' + database.escape(requestParam.id);
            let query_result = database.query(sql);
            response.status = query_result[0]?200:404;
            response.statusText = response.status === 404? 'not found' : 'found';
            break;
        }
        case 'checkUsername':{
            //try to check if there's any username with this name
            const username = url.searchParams.get('username');
            if(username){
                let sql = 'SELECT `username` FROM `users` WHERE `username` = ' + database.escape(username);
                let query_result = await database.query(sql);
                if(!query_result[0]){
                    //no username was found, this username can be taken
                    response = new Response('username available', {status: 200, statusText: "OK"});
                }
                else{
                    response = new Response('username not available',{status: 404, statusText: "Not found"});
                }
            }
            else{
                response = new Response('no username was provided to be checked', {status: 400, statusText: "bad request, no username was provided to be checked"});
            }
            break;
        }
        case 'insertUser':{
            const userSesssion = await getServerSession(options);
            const username = url.searchParams.get('username');
            const email = url.searchParams.get('email');
            const provider = url.searchParams.get('provider');
            const picture = url.searchParams.get('picture');
            if(userSesssion && picture && username && provider && email){
                
                let sql = 'INSERT INTO `users` (`username`,`email`,`picture`,`provider`) VALUES ?';
                let values = [[username,email,picture, provider]];
                try{
                    let query_result = await database.query(sql,[values]);
                    sql = 'SELECT `id` FROM `users` WHERE `email` = ' + database.escape(email);
                    sql = 'SELECT `id` FROM `users` WHERE `id` = LAST_INSERT_ID()';
                    query_result = await database.query(sql);
                    //since the user insertion succeeded, we are going to create a new watchlist table
                    sql = 'CREATE TABLE `users`.`' + `user_${query_result[0].id}_watchlist` + '` (`id` INT NOT NULL, PRIMARY KEY (`id`));'
                    query_result = await database.query(sql);
                    response = new Response('the insertion was success',{status: 200, statusText: 'OK'});
                }
                catch(err){
                    console.error("the sqlMessage was: ", err.sqlMessage);
                    console.error("the sql that produced the error was: ", err.sql);
                    response = new Response('the insertion failed',{status: 500, statusText: "Internal server failed, check console.log"});
                }

            }
            else{
                response = new Response('required field(s) was missing',{status: 400, statusText: "Bad request because required field(s) wasn't found"});
            }
            break;
        } 
        case null:{
            response = new Response("no param query was found", {status:400, statusText: "Bad request, because no param query was found"});
            break;
        }
        default:
        {
            response = new Response("This option isn't supported",{status: 400, statusText: "Bad request, because this option isn't supported"});
        }
    }
    return response;
}

export async function POST(req){
    //try to get the form result
    let response = undefined;
    const formData = await req.formData();
    const userID = formData.get('userID');
    const animeID = formData.get('animeID');
    const episodeID = formData.get('episodeID'); 
    const comment = formData.get('comment');
    if(userID && animeID && episodeID && comment && comment.length >=2){
        //all the parameters was accessed
        //first, verify whether the user actually exists, while also checking if the animeID and the episodeID is correct
        //const promises = await Promise.all([ServerSideRequests_user('getUserByID',{id: userID}), ]);
        ServerSideRequests_anime('verifyAnimeAndEpisode',{animeID: animeID, episodeID: episodeID});
        const promises = await Promise.all([ServerSideRequests_anime('verifyAnimeAndEpisode',{animeID: animeID, userID: userID, episodeID: episodeID}),
                                            ServerSideRequests_user('getUserByID',{userID: userID})]);
        //if the animeID and episodeID and the userID actually exist

        if(promises[0].status === 200 && promises[1].status === 200){
            //everything is alright, try to insert into the comments table
            //send an insertion request
            ServerSideRequests_anime('insertComment', {animeID: animeID, userID: userID, episodeID: episodeID, comment: comment});
        } 
        response = new Response("OK",{status: 200, statusText: "OK"});
    }
    else{
        //probably it's an admin panel access request;
        let admin_id = formData.get('adminID');
        let admin_password = formData.get('adminPassword');
        if(admin_id && admin_password && admin_id === process.env.API_AUTH_SECRET_ID && admin_password === process.env.API_AUTH_SECRET_PASSWORD){
            let cookie_details = cookies();
            cookie_details.set('adminAuthorized','true');
            response = new Response('OK', {status: 200, statusText: "OK"});
        }
        else{
            response = new Response("Unauthenticated",{status: 401, statusText: 'Unauthenticated'});
        }
    }
    return response;
}
