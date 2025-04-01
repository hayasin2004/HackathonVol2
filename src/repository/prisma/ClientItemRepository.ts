"use server"
import prisma from "@/lib/prismaClient";

//アイテム一覧取得
export const itemList = async (itemName: string) => {
    try {
        const existItemData = await prisma?.defaultItemList.findFirst({
            where:{
                itemName:itemName
            }
            })

        if(existItemData){
            console.log('アイテム情報を一覧にして表示')
            const itemListAll = prisma.defaultItemList.findMany({
            {orderBy : [{createdAt : "asc"}],
                where:{
                    itemName:itemName
                }

            })
            console.log(itemListAll)
        }


    }
    catch(err){
        console.log(err)
        return {status: "error", message: "サーバーエラー : アイテム一覧コードよりエラーが発生しました"}
    }


}


//インベントリにアイテム保存



// インベントリからアイテム削除
