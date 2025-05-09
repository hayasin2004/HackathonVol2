"use server"

import prisma from "@/lib/prismaClient";

const DSCQuest = async (playerId: number) => {

    try {
        const lastQuest = await prisma.playerQuest.findFirst({
            where: {playerId: playerId},
            include: {
                quest: true,
            },
            orderBy: {
                id: "desc", // id を降順に並べて最初のレコードを取得
            },
        });

        if (lastQuest) {
            return lastQuest
        }
    } catch (err) {
        console.error("初回クエストのフェッチエラーです: ", err)
        return null
    }

}

export default DSCQuest;