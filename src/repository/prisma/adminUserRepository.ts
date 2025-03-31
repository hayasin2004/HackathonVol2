"use server"
import prisma from "@/lib/prismaClient"
//アイテムを追加する処理

export const adminUserRepository = async (itemName: string , itemData: string | undefined) => {

    try{
        const existItemData = await prisma.DefalutItemList.findFirst({where: {userId: itemName})
        if(existItemData){
            console.log('すでに作成されているアイテムです')
        }
        }else {

            if(itemData == ""){
                const newItem = await prisma.DefalutItemList.create({
                    data:{
                        itemName: itemName,
                    }
                })
            }
        }

    }
        catch (err){
        console.log(err)
        }
    }
