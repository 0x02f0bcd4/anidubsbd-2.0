import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req){
    const token = await getToken({req});
    if(req.nextUrl.pathname.startsWith('/api/auth/signin') && token){
        return NextResponse.redirect('http://localhost:3000/');
    }
    else if(req.nextUrl.pathname.startsWith('/dashboard') && !token){
        return NextResponse.redirect('http://localhost:3000/api/auth/signin');
    }
}