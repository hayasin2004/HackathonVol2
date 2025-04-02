"use server"
import prisma from "@/lib/prismaClient"

export const signIn = async (email: string, password: string, username: string) => {
    console.log(email, password, username)
    const newUser = await prisma.user.create({data: {email: email, username: username, password: password}})
    console.log("newUser" + newUser)
}

export const logIn = async (userId: number | undefined) => {
    try {
        if (userId !== undefined) {
            const loginUser = await prisma.playerData.findUnique({
                where: {playerId: userId}
            })

            if (!loginUser) {
                const playerUserDate = await prisma.playerData.create({
                    data: {
                        playerId: userId,
                    },
                    //     successだったらuseRouterでcreateCharacterに飛ばす
                })
                console.log("playerUserDate" + JSON.stringify(playerUserDate))
                return {status: "success", message: "新規ユーザーデータを作成しました。"}
            } else {
                console.log("既にユーザーデータを作成済")
                return {status: "error", message: "おかえりなさい。"}
            }
        } else {
            return {status: "error", message: "ユーザーが見つからなかった"}
        }
    } catch (err) {
        console.log(err)
        return {status: "error", message: "ユーザーが見つからなかった"}
    }
}
console.log("logIn" + JSON.stringify(logIn))
