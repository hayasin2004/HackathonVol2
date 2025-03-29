"use server"
import prisma from "@/lib/prismaClient"

export  const updateUserRepository = async (email :string , password :string ,username : string) => {
    const newUser = await prisma.user.create({data : {email: email , username: username , password: password}})
    console.log("newUser" + newUser)
    const update = await prisma.user.update({
        where: {
            username: {username : newUser.username},
        },
        data: {
            newUsername: {username: newUser.username},
        },
    })
    console.log(update)
}
