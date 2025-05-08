"use server"

import prisma from "@/lib/prismaClient";

const firstQuest = async (playerId: number) => {

    try {
        const firstQuest = await prisma.playerQuest.findFirst({where: {playerId: playerId}})

        if (!firstQuest) {
            console.log("初めてこのクエストを受けます。")
            const firstQuestCreate = await prisma.playerQuest.create({
                data: {
                    playerId: playerId,
                    questId: 1,
                }
            })
            return firstQuestCreate;
        }
        if (firstQuest.complete == true){
            console.log("このクエストは既にクリアしています。")
            return firstQuest
        }

        else if (firstQuest && firstQuest.complete == false) {
            console.log("このクエストは進行中です。")
            return firstQuest
        }
        return firstQuest
    } catch (err) {
        console.error("初回クエストのフェッチエラーです: ", err)
        return null
    }

}

export default firstQuest;