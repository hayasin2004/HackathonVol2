"use server"

//アイテムを追加する処理
import prisma from "@/lib/prismaClient";

export const ItemIConCreate = async  (itemName : string ,itemDescription : string ,imageUrl:string) => {
    // Step 2: Itemモデルにデータを保存
    const newItem = await prisma.defaultItemList.create({
        data: {
            itemName: itemName,
            itemDescription: itemDescription ,
            x: 50,
            y: 50,
            width: 50,
            height: 50,
            itemIcon: imageUrl, // 画像URLを設定
        },
    });
}


export const adminItemRepositoryCreateItem = async (itemName: string, itemDescription: string) => {
    try {
        const existItemData = await prisma.defaultItemList.findFirst({
            where: {
                itemName: itemName
            }
        })
        if (existItemData) {
            console.log('すでに作成されているアイテムなので新しく更新します。')
        } else {

            // const newItem = await prisma.defaultItemList.create({
            //     // AND?
            //     data: {
            //         itemName: itemName,
            //         itemDescription: itemDescription,
            //
            //     }
            // })
            // console.log('新しいアイテムが誕生しました', newItem)
        }
    } catch (err) {
        console.log("アイテム作成中にエラーが発生しました:");
        return {status: "error", message: "サーバーエラー : アイテム作成中にエラーが発生しました"}
    }
}


// アイテム更新処理

export const adminItemRepositoryUpdateItem = async (itemName: string, itemDescription: string) => {
    try {
        const existItemData = await prisma.defaultItemList.findFirst({
            where: {
                itemName: itemName
            },
        })
        if (existItemData) {
            console.log('アイテムの情報を新しく更新します！')
            const updateItem = await prisma.defaultItemList.update({
                where: {
                    id: existItemData.id
                    // AND?
                }, data: {
                        itemName: itemName,
                        itemDescription: itemDescription,
                }
            })
            console.log('アイテムがアップグレードしました！！！' + updateItem)
        }


    } catch (err) {
        console.log(err);
        return {status: "error", message: "サーバーエラー : アイテム更新中にエラーが発生しました"}
    }
}

// アイテム削除処理
export const adminItemRepositoryDeleteItem = async (itemName: string) => {
    try {
        const existItemData = await prisma.defaultItemList.findFirst({
            where: {
                itemName: itemName
            }
        })
        if (existItemData) {
            console.log('削除対象アイテムです', itemName)
            const DeleteItem = await prisma.defaultItemList.delete({
                where: {
                    id: existItemData.id
                }
            })
        }
    } catch (err) {
        console.log(err);
        return {status: "error", message: "サーバーエラー : アイテム削除中にエラーが発生しました"}
    }
}



