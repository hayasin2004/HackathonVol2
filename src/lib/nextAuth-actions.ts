import {signOut} from "next-auth/react";

export async function logout(){
    try {
        await signOut({callbackUrl:"/signin"});
    }catch (err){
        console.error(err);
        return
    }
}