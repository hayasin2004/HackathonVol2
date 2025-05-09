// repository/prisma/quest/nextQuest/nextQuest.ts
"use server";

import prisma from "@/lib/prismaClient";

export const getNextQuest = async (currentQuestId: number, playerId: number) => {
    try {
        const firstQuest = await prisma.playerQuest.findFirst({
            where: {playerId: playerId, questId: currentQuestId + 1}, include: {
                quest: true
            }
        })
        if (!firstQuest) {


            console.log("初めてこのクエストを受けます。")
            const firstQuestCreate = await prisma.playerQuest.create({
                data: {
                    playerId: playerId,
                    questId: currentQuestId + 1,
                }
            })
            if (firstQuestCreate) {
                const firstQuest = await prisma.playerQuest.findFirst({
                    where: {AND: [{playerId: playerId, questId: currentQuestId + 1}]}, include: {
                        quest: true
                    }
                })
                return firstQuest;
            }
        }
        return firstQuest


    } catch (error) {
        console.error("次のクエスト取得中にエラーが発生しました:", error);
        throw error;
    }
};