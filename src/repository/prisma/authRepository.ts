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
            const loginUser = await findPlayerData(userId)

            if (loginUser.status == 200) {
                const playerPlaceCreate = await createPlayerData(userId)
                console.log("playerUserDate" + JSON.stringify(playerPlaceCreate))
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


export const findPlayerData = async (userId: number | undefined) => {
    const playerData = await prisma.playerData.findFirst({
        where: {
            playerId: userId
        }
    })
    if (playerData) {
        return {status: 200, playerData}
    } else {
        return {status: "error", userId: userId}
    }
}

export const createPlayerData = async (userId: number | undefined) => {
    const loginUser = await prisma.playerData.create({
        data: {playerId: userId}
    })
    if (loginUser) {
        return {status: 200, loginUser}
    } else {
        return {status: "error", userId: userId}
    }
}

export const savaPlayerPlaceData = async (userId: number | undefined , x :number | undefined , y : number | undefined) => {
    const playerPlaceData = await prisma.playerData.update({
        where: {
            playerId: userId
        }, data: {
            x: x,
            y: y,
        }
    })
    if (playerPlaceData) {
        return {status: 200, playerPlaceData}
    } else {
        return {status: "error", userId: userId}
    }
}


