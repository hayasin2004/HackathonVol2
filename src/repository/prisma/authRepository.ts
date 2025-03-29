"use server"
import prisma from "@/lib/prismaClient"

export  const signIn = async (email :string , password :string ,username : string) => {
    const newUser = await prisma.user.create({data : {email: email , username: username , password: password}})
    console.log("newUser" + newUser)
}



// export const logIn = async (email :string) => {
//     const loginUser = await prisma.user.findUnique({where : {email: email}})
//     console.log("loginUser" + JSON.stringify(loginUser))
// }