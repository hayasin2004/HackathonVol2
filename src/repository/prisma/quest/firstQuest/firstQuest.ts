"use server"

import prisma from "@/lib/prismaClient";

const firstQuest = async ()=>{

    try {
        const firstQuestFetch  =await  prisma.quest.findFirst({where : {id : 1}})
        return  firstQuestFetch
    }catch (err){
        console.error("初回クエストのフェッチエラーです: ", err)
        return null
    }

}

export default firstQuest;