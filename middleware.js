import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req){
    const token = await getToken({req});
    if(req.nextUrl.pathname.startsWith('/api/auth/signin') && token){
        console.log("the user is alread signed in, redirecting to home");
        return NextResponse.redirect('http://localhost:3000/');
    }
    else if(req.nextUrl.pathname.startsWith('/dashboard') && !token){
        console.log("the user isn't signed in and trying to access dashboard, redirect to signin page");
        return NextResponse.redirect('http://localhost:3000/api/auth/signin');
    }
}