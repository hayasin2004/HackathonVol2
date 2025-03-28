"use server"

import {supabase} from "@/lib/supabase";

export const signIn = async (email :string , password :string ,username : string) => {
    console.log(supabase)
    const {data  ,error} = await  supabase
        .from("user")
        .insert({email, password,username})
    // エラーハンドリング
    if (error) {
        console.log("ここにログが入ってしまっている")
        console.log("sfsfpfs")
        throw error
    };

//     成功したときのログ
    console.log("success userData created" , data)
    return {data : data ,status :200}
}