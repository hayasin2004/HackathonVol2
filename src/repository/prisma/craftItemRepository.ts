// import prisma from "@/lib/prismaClient";
//
// export const craftItemRepository = async ( userId : number,CreateItemId: number ) => {
//     try {
//         // userIdはplayerDataから取得したきたplayerIdを想定
//         // createItemIdを作成するアイテムをフロントから渡す
//
//
//         // 試験的に
//         const userIdTest = 1
//         const createItemId = 1
//
//
//         const playerItems = await prisma.playerItem.findMany({
//             where: {
//                 itemId: {in: requiredItems.map((item) => item.itemId)}
//             }
//         })
//
//         const createItemData = await prisma.defaultItemList.findFirst({
//             where: {
//                 id: CreateItemId
//             }
//         })
//
//         // 必要アイテムと数量チェック
//         // requiredItemsとplayerItemsを用いてクラフト可能かをチェック
//         // everyは配列のすべての要素が満たしていたらTrueで返す
//         // inventoryItem.quantity(所持数),inventoryItem(所持アイテム)
//         // reqItem(必要なアイテム)
//
//         const isCraftTable = requiredItems.every((reqItem) => {
//             const inventoryItem = playerItems.find((item) => item.itemId === reqItem.itemId);
//             return inventoryItem && inventoryItem.quantity >= reqItem.quantity;
//         });
//
//
//         if (!isCraftTable || !createItemData) {
//             return {status: 'error', message: '必要なアイテムが不足しています'}
//         } else {
//             //     必要アイテムの消費
//             for (const reqItem of requiredItems) {
//                 await prisma.playerItem.update({
//                     where: {
//                         id: reqItem.itemId,
//                         itemId: reqItem.itemId,
//                         playerDataId: userId
//                     },
//                     data: {
//                         quantity: {decrement: reqItem.quantity}
//                     }
//                 })
//             }
//
//             const newItem = await prisma.defaultItemList.create({
//                 data: {
//                     playerDataId: userId,
//                     itemId: createItemData.id,
//                 }
//             })
//             return {status: 'success', message: '{resultItemName}がクラフトされました！', item: newItem};
//
//         }
//     } catch (err) {
//         console.log(err);
//         return {status: 'error', message: 'クラフト中にエラーが発生しました'}
//     }
// }
