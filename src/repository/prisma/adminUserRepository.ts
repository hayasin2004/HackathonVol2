"use server"

//アイテムを追加する処理
import prisma from "@/lib/prismaClient";
import {defaultItem} from "@/types/defaultItem";

export const adminUserRepositoryCreateItem = async (itemName: string, itemDescription: string) => {
    try {
        const existItemData = await prisma.defaultItemList.findFirst({
            where: {
                itemName: itemName
            }
        })
        if (existItemData) {
            console.log('すでに作成されているアイテムです')
        } else {

            const newItem = await prisma.defaultItemList.create({
                data: {
                    itemName: itemName,
                    itemDescription: itemDescription,
                }
            })
            console.log('新しいアイテムが誕生しました', newItem)
        }
    } catch (err) {
        console.log("アイテム作成中にエラーが発生しました:");
        return {status: "error", message: "サーバーエラー : アイテム作成中にエラーが発生しました"}
    }
}


// アイテム削除処理
export const adminUserRepositoryDeleteItem = async (itemName: string, id :number, targetItem: defaultItem | null) => {
    try{
        const existItemData = await prisma.defaultItemList.findFirst({
            where: {
                itemName: itemName
            }
        })
        if (existItemData) {
            console.log('削除対象アイテムです', itemName)
            const DeleteItem = await prisma.defaultItemList.delete({
                where:{
                    id: targetItem?.defaultItem.id,
                    itemName: itemName
                }
            })
        }


    }catch(err){



        console.log(err);
    }
}


// アイテム更新処理

