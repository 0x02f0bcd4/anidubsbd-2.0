import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { ServerSideRequests_user } from '../../user_DBAP/route';

export const options = { 
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET
        })
    ], 

    callbacks:{ 
        async redirect({url, baseUrl}){
            return '/welcome';
        },
        async jwt(jwt_details){
            //try to check if the user is already in the database, if no, then set the token to contain verified: false, else true
            
            if(jwt_details.trigger === 'update'){
                //if the trigger is update, try to match all the details
                //first, check if the email and provider is still set
                if(jwt_details.token.email && jwt_details.token.provider){
                    //they are still set, try to check if the user actually exists in the database
                    let response = await ServerSideRequests_user('getUserByEmail', {email: jwt_details.token.email, provider: jwt_details.token.provider});
                    if(response.status === 200){
                        //alright, so the user does exists in the database
                        //now, check if the username and the picture matches
                        if( response.values.picture === jwt_details.token.picture){
                            //so the image has also not been modified
                            //set the username and the verified field to true
                            jwt_details.token.userID = response.values.id;
                            jwt_details.token.username = response.values.username;
                            jwt_details.token.verified = true;
                        }
                    }
                    else{
                        console.log("the response status wasn't 200: ", response.status);
                    }
                }
            }
            else if(jwt_details.trigger === 'signIn' && jwt_details.account && jwt_details.user){
                //during signin

                const response = await ServerSideRequests_user('getUserByEmail',{email: jwt_details.user.email, provider: jwt_details.account.provider});
                jwt_details.token.name = undefined;
                jwt_details.token.username = undefined;
                jwt_details.token.userID = undefined;
                if(jwt_details.token.verified = (response.status===200)){
                    jwt_details.token.userID = response.values.id;
                    jwt_details.token.username = response.values.username;
                }
                jwt_details.token.provider = jwt_details.account.provider;
            }
            return jwt_details.token;
        },
        async session(session_details)
        {
            session_details.session.user.userID = session_details.token.userID;
            session_details.session.provider = session_details.token.provider;
            session_details.session.verified = session_details.token.verified;
            session_details.session.user.username = session_details.token.username;
            return session_details.session;
        }
    }
}