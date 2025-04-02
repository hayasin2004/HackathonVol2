'use client'
import React, {useState} from 'react';
import {
    adminItemRepositoryCreateItem,
    adminItemRepositoryDeleteItem,
    adminItemRepositoryUpdateItem
} from "@/repository/prisma/adminItemRepository";
import prisma from "@/lib/prismaClient";
import {itemList} from "@/repository/prisma/ClientItemRepository";
import {getServerSession} from "next-auth";
import {authOptions} from "@/auth";


const getItem = async () => {

    const [itemName, setItemName] = useState<string>('');
    const [itemDescription, setItemDescription] = useState<string>('');

    const handleGetItem = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        const response = await adminItemRepositoryCreateItem(itemName, itemDescription)
        console.log(response)
    }
    const handleUpdateItem = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        const response = adminItemRepositoryUpdateItem(itemName, itemDescription)
        console.log(response)
    }
    const handleDeleteItem = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        e.preventDefault()
        const response = adminItemRepositoryDeleteItem(itemName)
        console.log(response)
    }
    const session = await getServerSession(authOptions)

    const userHaveCharacterData = await prisma.character.findFirst({
        where: {
            userId: session?.user.id
        }
    })
    const itemArray= await itemList()


    console.log("取得してきた userHaveCharacterData :" + JSON.stringify(userHaveCharacterData))

    return (
        <div>
            <form>
                <br/>
                <label htmlFor='itemName'>Item Name</label>
                <input name={'itemName'} type="text" id='itemName' onChange={(e) => setItemName(e.target.value)}/>
                <br/>
                <label htmlFor='ItemDescription'>Item Description</label>
                <input name={'ItemDescription'} type='text' id='ItemDescription'
                       onChange={(e) => setItemDescription(e.target.value)}/>
                <button type={"submit"} onClick={handleGetItem}>送信</button>
                <br/>

                {itemArray?.map((defaultItem:{id:number,itemName:string,itemDescription:string}) => (
                    <div key={defaultItem.id}>
                        <h2>アイテム: {defaultItem.id}</h2>
                        <h2>アイテム名: {defaultItem.itemName}</h2>
                        <h2>アイテム説明: {defaultItem.itemDescription}</h2>
                        <button type={"submit"} onClick={handleDeleteItem}>削除</button>
                        <h1>ここでアイテムの更新</h1>
                        <label>Item Name</label>
                        <input name={'itemName'} onChange={(e) => setItemName(e.target.value)}/>
                        <label htmlFor='ItemDescription'>Item Description</label>
                        <input name={'ItemDescription'} type='text' id='ItemDescription'
                               onChange={(e) => setItemDescription(e.target.value)}/>
                        <button type={"submit"} onClick={handleUpdateItem}>送信</button>
                    </div>
                ))}

            </form>
        </div>
    );
}


export default getItem;