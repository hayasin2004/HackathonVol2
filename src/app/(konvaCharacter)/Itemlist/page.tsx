// import React from 'react';
// import Image from "next/image";
// import {defaultItem} from "@/types/defaultItem";
// import {getServerSession} from "next-auth";
// import {authOptions} from "@/auth";
// import prisma from "@/lib/prismaClient";
// import {allNeedCraftItem, itemList} from "@/repository/prisma/ClientItemRepository";
//
// const ItemList = async () => {
//     const session = await getServerSession(authOptions)
//
//     const userHaveCharacterData = await prisma.character.findFirst({
//         where: {
//             userId: session?.user.id
//         }
//     })
//
//     const itemArray = await itemList()
//
//     const needCraftItem = await allNeedCraftItem()
//     console.log(needCraftItem)
//
//
//     console.log("取得してきた userHaveCharacterData :" + JSON.stringify(userHaveCharacterData))
//
//
//     return (
//         <div>
//
//             <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px' , padding: '20px'}}>
//                 {itemArray?.map((defaultItem: defaultItem) => (
//                     <div
//                         key={defaultItem.id}
//                         style={{
//                             flex: '1 0 22%',
//                             border: '1px solid #ccc',
//                             padding: '16px',
//                             boxSizing: 'border-box',
//                             textAlign: 'center',
//                         }}
//                     >
//                         <h3>アイテムID: {defaultItem.id}</h3>
//                         <p>名前: {defaultItem.itemName}</p>
//                         <p>説明: {defaultItem.itemDescription}</p>
//                         <div style={{width: '150px', height: '150px', margin: '0 auto', overflow: 'hidden'}}>
//                             <Image
//                                 src={defaultItem.itemIcon || "/"}
//                                 alt="アイテムアイコン"
//                                 width={150}
//                                 height={150}
//                                 style={{objectFit: 'contain'}} // アスペクト比を保って中に収める
//                             />
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };
//
// export default ItemList;