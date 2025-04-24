"use server"

import prisma from "@/lib/prismaClient";

export const GetNpc = async  () => {

    try {

        const data = await  prisma.nPC.findMany({})

        if (!data){
            console.log("NPCデータ取得失敗")
            return null
        }

        return data



    }catch (err){
        console.log("NPCデータ取得エラー" + err)
        return null
    }

}
