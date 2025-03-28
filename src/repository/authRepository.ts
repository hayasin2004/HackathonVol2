"use server"
import {supabase} from "@/lib/supabase";
import prisma from "@/lib/prismaClient"

export const signIn = async (email :string , password :string ,username : string) => {
    console.log(supabase)
    const newUser = await prisma.user.create({data : {email: email , username: username , password: password},})
    console.log(newUser)
}