"use server"
import prisma from "@/lib/prismaClient"
//アイテムを追加する処理

export const adminUserRepository = async (itemName: string , itemData: string | undefined) => {

    try {
        // 市川型指定の問題。
        const existItemData = await prisma.defalutItemList.findFirst({where: {userId: itemName}})

        if (existItemData) {
            console.log('すでに作成されているアイテムです')
        } else {

            if (itemData == "") {
                const newItem = await prisma.defalutItemList.create({
                    data: {
                        itemName: itemName,
                    }
                })
                console.log(newItem)

            }

        }
    }catch (err)
    {
        console.log(err)
        }
    }
