"use server"
import prisma from "@/lib/prismaClient"


export const updateUserRepository = async (
    id : number,
    email: string,
    username: string,
    description: string,
    password: string
) => {
    try {
        console.log("username" + username)
        const update = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                username: username,
                description: description,
                email: email,
                password: password,
            },
        })
        console.log("更新前名前" + id)
        console.log("更新後名前" + update.username)　
    } catch (err) {
        console.log(err)
        return null
    }
}
